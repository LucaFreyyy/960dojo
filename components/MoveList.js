import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    buildEvalTemplate,
    isFiniteNumber,
    parsePgnTree,
    validateEvalShape,
} from '../lib/moveListEval';

export {
    createLine,
    parsePgnTree,
    stripPgn,
    tokenizePgn,
    buildEvalTemplate,
    validateEvalShape,
} from '../lib/moveListEval';

function clonePath(path) {
    return Array.isArray(path) ? [...path] : [];
}

function getLineByPath(mainline, variationPath) {
    let line = mainline;
    for (const segment of variationPath) {
        const [moveIndexRaw, varIndexRaw] = String(segment).split(':');
        const moveIndex = Number(moveIndexRaw);
        const varIndex = Number(varIndexRaw);
        const node = line[moveIndex];
        if (!node || !node.variations[varIndex]) return [];
        line = node.variations[varIndex];
    }
    return line;
}

function getParentSelectionFromVariationPath(variationPath) {
    if (!variationPath.length) return null;
    const parentPath = variationPath.slice(0, -1);
    const [anchorMoveRaw] = String(variationPath[variationPath.length - 1]).split(':');
    const anchorIndex = Number(anchorMoveRaw);
    if (Number.isNaN(anchorIndex)) return { index: -1, variationPath: [] };
    return { index: anchorIndex, variationPath: parentPath };
}

function colorFromEval(evalValue, userColor) {
    if (!isFiniteNumber(evalValue)) return '#d0d0d0';
    let v = evalValue;
    if (userColor === 'black') v = -v;
    const min = -5;
    const max = 5;
    const clamped = Math.max(min, Math.min(max, v));
    const strength = 0.5;

    if (clamped >= 0) {
        const t = Math.pow(clamped / max, strength);
        const r = Math.round(255 - (255 - 74) * t);
        const g = Math.round(255 - (255 - 190) * t);
        const b = Math.round(255 - (255 - 93) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    const t = Math.pow(Math.abs(clamped / min), strength);
    const r = Math.round(255 - (255 - 210) * t);
    const g = Math.round(255 - (255 - 79) * t);
    const b = Math.round(255 - (255 - 64) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

export default function MoveList({
    pgn,
    evalData,
    userColor,
    loading,
    onBrowsePositionChanged,
    selectedPosition = null,
    resetSelectionOnPgnChange = true,
}) {
    const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
    const template = useMemo(() => buildEvalTemplate(tree), [tree]);
    const hasValidEvalData = useMemo(
        () => validateEvalShape(evalData, template),
        [evalData, template]
    );

    const [selection, setSelection] = useState({ index: -1, variationPath: [] });
    const suppressNextBrowseCallbackRef = useRef(false);

    useEffect(() => {
        if (!resetSelectionOnPgnChange) return;
        setSelection({ index: -1, variationPath: [] });
    }, [pgn, resetSelectionOnPgnChange]);

    useEffect(() => {
        if (!selectedPosition) return;
        const nextIndex = Number.isInteger(selectedPosition.index) ? selectedPosition.index : -1;
        const nextPath = Array.isArray(selectedPosition.variationPath) ? selectedPosition.variationPath : [];
        setSelection((prev) => {
            const sameIndex = prev.index === nextIndex;
            const samePath = prev.variationPath.length === nextPath.length
                && prev.variationPath.every((x, i) => x === nextPath[i]);
            if (sameIndex && samePath) return prev;
            suppressNextBrowseCallbackRef.current = true;
            return { index: nextIndex, variationPath: [...nextPath] };
        });
    }, [selectedPosition]);

    useEffect(() => {
        if (suppressNextBrowseCallbackRef.current) {
            suppressNextBrowseCallbackRef.current = false;
            return;
        }
        onBrowsePositionChanged(selection.index, clonePath(selection.variationPath));
    }, [onBrowsePositionChanged, selection]);

    const pathToEval = useMemo(() => {
        const map = new Map();

        function walk(line, evalLine, path) {
            let evalCursor = path.length === 0 ? 1 : 0;
            for (let i = 0; i < line.length; i += 1) {
                const node = line[i];
                const key = `${path.join('|') || 'main'}:${i}`;
                map.set(key, Array.isArray(evalLine) ? evalLine[evalCursor] : undefined);
                evalCursor += 1;
                for (let v = 0; v < node.variations.length; v += 1) {
                    const nextEvalLine = Array.isArray(evalLine) ? evalLine[evalCursor] : undefined;
                    walk(node.variations[v], nextEvalLine, [...path, `${i}:${v}`]);
                    evalCursor += 1;
                }
            }
        }

        if (hasValidEvalData) {
            map.set('main:initial', evalData[0]);
            walk(tree, evalData, []);
        }
        return map;
    }, [evalData, hasValidEvalData, tree]);

    const currentSelectedEval = useMemo(() => {
        if (!hasValidEvalData) return null;
        if (selection.index < 0) {
            if (selection.variationPath.length === 0) {
                const initialEval = pathToEval.get('main:initial');
                return isFiniteNumber(initialEval) ? initialEval : null;
            }
            return null;
        }
        const key = `${selection.variationPath.join('|') || 'main'}:${selection.index}`;
        const value = pathToEval.get(key);
        return isFiniteNumber(value) ? value : null;
    }, [hasValidEvalData, pathToEval, selection]);
    const currentSelectedEvalColor = useMemo(() => {
        if (!isFiniteNumber(currentSelectedEval)) return '#d0d7e5';
        return colorFromEval(currentSelectedEval, userColor);
    }, [currentSelectedEval, userColor]);

    const goToInitial = useCallback(() => {
        setSelection({ index: -1, variationPath: [] });
    }, []);

    const goToMainlineEnd = useCallback(() => {
        setSelection({ index: Math.max(-1, tree.length - 1), variationPath: [] });
    }, [tree.length]);

    const goNext = useCallback(() => {
        setSelection((prev) => {
            const line = getLineByPath(tree, prev.variationPath);
            if (prev.index < line.length - 1) return { ...prev, index: prev.index + 1 };
            if (prev.variationPath.length > 0) return prev;
            return prev;
        });
    }, [tree]);

    const goPrev = useCallback(() => {
        setSelection((prev) => {
            if (prev.index > 0) return { ...prev, index: prev.index - 1 };
            if (prev.index === 0 && prev.variationPath.length > 0) {
                const parentSelection = getParentSelectionFromVariationPath(prev.variationPath);
                return parentSelection || { index: -1, variationPath: [] };
            }
            if (prev.index === -1 && prev.variationPath.length > 0) {
                const parentSelection = getParentSelectionFromVariationPath(prev.variationPath);
                return parentSelection || { index: -1, variationPath: [] };
            }
            if (prev.index === 0) return { ...prev, index: -1 };
            return prev;
        });
    }, []);

    useEffect(() => {
        function onKeyDown(event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [goNext, goPrev]);

    function renderMoveButton(node, index, path, prefix = '', fullWidth = false) {
        if (!node) return null;
        const key = `${path.join('|') || 'main'}:${index}`;
        const selected = selection.index === index
            && selection.variationPath.length === path.length
            && selection.variationPath.every((x, idx) => x === path[idx]);
        const evalValue = hasValidEvalData ? pathToEval.get(key) : null;
        const color = selected ? '#101010' : hasValidEvalData ? colorFromEval(evalValue, userColor) : '#e6e6e6';
        const background = selected ? '#f6d94d' : 'transparent';

        return (
            <button
                type="button"
                onClick={() => setSelection({ index, variationPath: clonePath(path) })}
                style={{
                    border: 'none',
                    background,
                    color,
                    borderRadius: 6,
                    padding: fullWidth ? '6px 8px' : '2px 6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textAlign: 'left',
                    width: fullWidth ? '100%' : 'auto',
                    display: fullWidth ? 'block' : 'inline-block',
                }}
            >
                {prefix}
                {node.san}
            </button>
        );
    }

    function renderVariationLine(line, path, moveNoStart = 1) {
        let moveNo = moveNoStart;
        return (
            <span>
                {line.map((node, i) => {
                    const showMoveNo = (i % 2) === 0;
                    const moveLabel = showMoveNo ? `${moveNo}. ` : '';
                    if (!showMoveNo) moveNo += 1;
                    const segmentPath = [...path];

                    return (
                        <span key={`${segmentPath.join('|') || 'main'}:${i}`}>
                            {renderMoveButton(node, i, segmentPath, moveLabel)}
                            <span style={{ marginRight: 4 }} />
                            {node.variations.map((variation, vIdx) => (
                                <span key={`${segmentPath.join('|')}:${i}:var-${vIdx}`} style={{ color: '#a9b4c9', marginLeft: 4 }}>
                                    ( {renderVariationLine(variation, [...segmentPath, `${i}:${vIdx}`], moveNo)} )
                                </span>
                            ))}
                            <span style={{ marginRight: 6 }} />
                        </span>
                    );
                })}
            </span>
        );
    }

    function renderMainlineRows() {
        const rows = [];
        for (let i = 0; i < tree.length; i += 2) {
            const whiteNode = tree[i];
            const blackNode = tree[i + 1];
            const moveNumber = Math.floor(i / 2) + 1;

            rows.push(
                <div
                    key={`main-row-${i}`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '44px 1fr 1fr',
                        gap: 8,
                        alignItems: 'center',
                        padding: '4px 0',
                        borderBottom: '1px solid #1f2533',
                    }}
                >
                    <div style={{ color: '#93a3bf', fontWeight: 600 }}>{moveNumber}.</div>
                    <div>{renderMoveButton(whiteNode, i, [], '', true)}</div>
                    <div>{renderMoveButton(blackNode, i + 1, [], '', true)}</div>
                </div>
            );

            const whiteVariations = whiteNode?.variations || [];
            const blackVariations = blackNode?.variations || [];
            const combined = [
                ...whiteVariations.map((line, vIdx) => ({ line, path: [`${i}:${vIdx}`], moveNo: moveNumber })),
                ...blackVariations.map((line, vIdx) => ({ line, path: [`${i + 1}:${vIdx}`], moveNo: moveNumber + 1 })),
            ];

            for (let v = 0; v < combined.length; v += 1) {
                const variation = combined[v];
                rows.push(
                    <div
                        key={`main-row-${i}-var-${v}`}
                        style={{
                            padding: '6px 10px 8px 54px',
                            color: '#a9b4c9',
                            fontSize: 14,
                            borderBottom: '1px dashed #1b2230',
                        }}
                    >
                        ( {renderVariationLine(variation.line, variation.path, variation.moveNo)} )
                    </div>
                );
            }
        }
        return rows;
    }

    return (
        <div style={{
            background: '#151821',
            border: '1px solid #2a2f3a',
            borderRadius: 14,
            padding: 14,
            boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
        }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button type="button" onClick={goToInitial} className="ml-btn">{'<<'}</button>
                <button type="button" onClick={goPrev} className="ml-btn">{'<'}</button>
                <button type="button" onClick={goNext} className="ml-btn">{'>'}</button>
                <button type="button" onClick={goToMainlineEnd} className="ml-btn">{'>>'}</button>
            </div>

            <div style={{
                minHeight: 180,
                borderRadius: 10,
                border: '1px solid #2f3644',
                background: '#0f131a',
                padding: 12,
                lineHeight: 1.9,
            }}>
                {tree.length > 0 ? renderMainlineRows() : <span style={{ color: '#aab3c2' }}>Paste a PGN and click Update PGN.</span>}
            </div>
            {loading ? (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#9fb0cf', fontSize: 13 }}>
                    <div className="spinner" />
                    Loading move list...
                </div>
            ) : null}

            {isFiniteNumber(currentSelectedEval) ? (
                <div style={{ marginTop: 12, color: '#d0d7e5', fontSize: 14 }}>
                    <strong>Eval:</strong>{' '}
                    <span style={{ color: currentSelectedEvalColor, fontWeight: 700 }}>
                        {currentSelectedEval}
                    </span>
                </div>
            ) : null}

            <style jsx>{`
                .ml-btn {
                    background: #202636;
                    color: #e8edf8;
                    border: 1px solid #3a4358;
                    border-radius: 8px;
                    padding: 6px 10px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .ml-btn:hover {
                    background: #2a3347;
                }
                .spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid #2a3a5b;
                    border-top-color: #7ab2ff;
                    border-radius: 50%;
                    animation: spin 0.9s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
