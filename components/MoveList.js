import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { formatEval, evalSummaryClass } from '../lib/evalDisplay';
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

function lossToneClass(lossCp) {
    if (!Number.isFinite(lossCp)) return 'move-btn--tone-neutral';
    if (lossCp < 50) return 'move-btn--tone-best';
    if (lossCp < 150) return 'move-btn--tone-mid';
    if (lossCp < 300) return 'move-btn--tone-bad';
    return 'move-btn--tone-worst';
}

export default function MoveList({
    pgn,
    evalData,
    userColor,
    startTurn = 'white',
    loading,
    loadingMessage = 'Analyzing position...',
    onBrowsePositionChanged,
    selectedPosition = null,
    resetSelectionOnPgnChange = true,
    className = '',
    allowSparseEvalData = false,
    /** Optional engine MultiPV rows shown above the game moves (analysis). */
    engineBestLines = null,
    /** `(rank | null)` — rank is engine multipv index (1-based); null when pointer leaves the block. */
    onEngineLineHover = null,
}) {
    const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
    const template = useMemo(() => buildEvalTemplate(tree), [tree]);
    const hasValidEvalData = useMemo(() => {
        if (!allowSparseEvalData) return validateEvalShape(evalData, template);
        const isStructuredLikeTemplate = (value, tmpl) => {
            if (!Array.isArray(value) || !Array.isArray(tmpl) || value.length !== tmpl.length) return false;
            for (let i = 0; i < tmpl.length; i += 1) {
                if (Array.isArray(tmpl[i])) {
                    if (!isStructuredLikeTemplate(value[i], tmpl[i])) return false;
                }
            }
            return true;
        };
        return isStructuredLikeTemplate(evalData, template);
    }, [allowSparseEvalData, evalData, template]);

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

    const pathToPlyBefore = useMemo(() => {
        const map = new Map();
        function walk(line, path, plyStart) {
            for (let i = 0; i < line.length; i += 1) {
                const node = line[i];
                const key = `${path.join('|') || 'main'}:${i}`;
                map.set(key, plyStart + i);
                for (let v = 0; v < node.variations.length; v += 1) {
                    walk(node.variations[v], [...path, `${i}:${v}`], plyStart + i + 1);
                }
            }
        }
        walk(tree, [], 0);
        return map;
    }, [tree]);

    function prevEvalFor(path, index) {
        if (!hasValidEvalData) return null;
        if (index > 0) {
            const key = `${path.join('|') || 'main'}:${index - 1}`;
            const value = pathToEval.get(key);
            return isFiniteNumber(value) ? value : null;
        }
        if (path.length === 0) {
            const initial = pathToEval.get('main:initial');
            return isFiniteNumber(initial) ? initial : null;
        }
        const parentPath = path.slice(0, -1);
        const [anchorMoveRaw] = String(path[path.length - 1]).split(':');
        const anchorIndex = Number(anchorMoveRaw);
        if (Number.isNaN(anchorIndex)) return null;
        const parentKey = `${parentPath.join('|') || 'main'}:${anchorIndex}`;
        const parentValue = pathToEval.get(parentKey);
        return isFiniteNumber(parentValue) ? parentValue : null;
    }

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
        const evalText = isFiniteNumber(evalValue) ? formatEval(evalValue) : null;
        let annotation = '';
        let lossCp = null;
        const prevEval = prevEvalFor(path, index);
        const plyBefore = pathToPlyBefore.get(key);
        if (
            isFiniteNumber(prevEval)
            && isFiniteNumber(evalValue)
            && Number.isInteger(plyBefore)
            && Math.abs(prevEval) <= 100
            && Math.abs(evalValue) <= 100
        ) {
            const moverIsWhite = startTurn === 'white' ? (plyBefore % 2 === 0) : (plyBefore % 2 === 1);
            lossCp = moverIsWhite
                ? Math.round((prevEval - evalValue) * 100)
                : Math.round((evalValue - prevEval) * 100);
            if (lossCp > 250) annotation = '??';
            else if (lossCp > 150) annotation = '?';
            else if (lossCp >= 50) annotation = '?!';
        }
        const toneClass = hasValidEvalData ? lossToneClass(lossCp) : 'move-btn--tone-neutral';
        const selectedClass = selected ? 'move-btn--selected' : '';

        return (
            <button
                type="button"
                onClick={() => setSelection({ index, variationPath: clonePath(path) })}
                className={`move-btn ${fullWidth ? 'move-btn--full' : 'move-btn--inline'} ${toneClass} ${selectedClass}`.trim()}
            >
                <span>
                    {prefix}
                    {node.san}
                    {annotation}
                    {node.comment ? (
                        <span className="move-btn__comment" title={node.comment} aria-label="Move comment">
                            c
                        </span>
                    ) : null}
                </span>
                {evalText ? <span className="move-btn__eval">{evalText}</span> : null}
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
                            <span className="move-list__spacer-sm" />
                            {node.variations.map((variation, vIdx) => (
                                <span key={`${segmentPath.join('|')}:${i}:var-${vIdx}`} className="move-list__variation-inner">
                                    ( {renderVariationLine(variation, [...segmentPath, `${i}:${vIdx}`], moveNo)} )
                                </span>
                            ))}
                            <span className="move-list__spacer-md" />
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
                <div key={`main-row-${i}`} className="move-list__row">
                    <div className="move-list__num">{moveNumber}.</div>
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
                    <div key={`main-row-${i}-var-${v}`} className="move-list__variation">
                        ( {renderVariationLine(variation.line, variation.path, variation.moveNo)} )
                    </div>
                );
            }
        }
        return rows;
    }

    const evalClass = evalSummaryClass(currentSelectedEval, userColor);

    return (
        <div className={`move-list ${className}`.trim()}>
            <div className="move-list__nav">
                <button type="button" onClick={goToInitial} className="ml-btn">{'<<'}</button>
                <button type="button" onClick={goPrev} className="ml-btn">{'<'}</button>
                <button type="button" onClick={goNext} className="ml-btn">{'>'}</button>
                <button type="button" onClick={goToMainlineEnd} className="ml-btn">{'>>'}</button>
            </div>

            {Array.isArray(engineBestLines) && engineBestLines.length > 0 ? (
                <div
                    className="move-list__engine-lines"
                    onMouseLeave={() => onEngineLineHover?.(null)}
                >
                    <div className="move-list__engine-lines-title">Engine lines</div>
                    <ol className="move-list__engine-lines-list">
                        {engineBestLines.map((row) => (
                            <li
                                key={row.rank}
                                className="move-list__engine-line"
                                onMouseEnter={() => onEngineLineHover?.(row.rank)}
                            >
                                <span className="move-list__engine-line-eval">{row.evalText}</span>
                                <span className="move-list__engine-line-pv">{row.pvText}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            ) : null}

            <div className="move-list__body">
                {tree.length > 0 ? (
                    renderMainlineRows()
                ) : (
                    <div className="move-list__empty">
                        <span className="move-list__empty-title">No moves yet</span>
                    </div>
                )}
            </div>
            {loading ? (
                <div className="move-list__loading">
                    <div className="ml-spinner" />
                    <span>{loadingMessage}</span>
                </div>
            ) : null}

            {isFiniteNumber(currentSelectedEval) ? (
                <div className="move-list__eval-line">
                    <strong>Eval:</strong>{' '}
                    <span className={`move-list__eval-strong ${evalClass}`}>
                        {formatEval(currentSelectedEval)}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
