import { useCallback, useEffect, useMemo, useState } from 'react';

export function stripPgn(raw) {
    return (raw || '')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\{[^}]*\}/g, ' ')
        .replace(/;[^\n\r]*/g, ' ')
        .replace(/\$\d+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function tokenizePgn(raw) {
    const cleaned = stripPgn(raw);
    if (!cleaned) return [];
    const split = cleaned
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    return split.filter((token) => {
        if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) return false;
        if (/^\d+\.(\.\.)?$/.test(token)) return false;
        if (/^\d+\.\.\.$/.test(token)) return false;
        return true;
    });
}

export function createLine() {
    const line = [];
    line.rootVariations = [];
    return line;
}

export function parsePgnTree(raw) {
    const tokens = tokenizePgn(raw);
    const mainline = createLine();
    const stack = [{ line: mainline, anchorNode: null }];
    let current = stack[0];

    for (const token of tokens) {
        if (token === '(') {
            const variation = createLine();
            if (current.anchorNode) {
                current.anchorNode.variations.push(variation);
            } else {
                current.line.rootVariations.push(variation);
            }
            stack.push({ line: variation, anchorNode: null });
            current = stack[stack.length - 1];
            continue;
        }
        if (token === ')') {
            if (stack.length > 1) stack.pop();
            current = stack[stack.length - 1];
            continue;
        }
        if (token.includes('.')) continue;

        const node = { san: token, variations: [] };
        current.line.push(node);
        current.anchorNode = node;
    }

    return mainline;
}

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

export function buildEvalTemplate(line) {
    const out = [];
    for (const node of line) {
        out.push('x');
        for (const variation of node.variations) {
            out.push(buildEvalTemplate(variation));
        }
    }
    return out;
}

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

export function validateEvalShape(value, template) {
    if (!Array.isArray(value) || !Array.isArray(template)) return false;
    if (value.length !== template.length) return false;
    for (let i = 0; i < template.length; i += 1) {
        const expected = template[i];
        const actual = value[i];
        if (Array.isArray(expected)) {
            if (!validateEvalShape(actual, expected)) return false;
        } else if (!isFiniteNumber(actual)) {
            return false;
        }
    }
    return true;
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
}) {
    const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
    const template = useMemo(() => buildEvalTemplate(tree), [tree]);
    const hasValidEvalData = useMemo(
        () => validateEvalShape(evalData, template),
        [evalData, template]
    );

    const [selection, setSelection] = useState({ index: -1, variationPath: [] });

    useEffect(() => {
        setSelection({ index: -1, variationPath: [] });
    }, [pgn]);

    useEffect(() => {
        onBrowsePositionChanged(selection.index, clonePath(selection.variationPath));
    }, [onBrowsePositionChanged, selection]);

    const pathToEval = useMemo(() => {
        const map = new Map();

        function walk(line, evalLine, path) {
            let evalCursor = 0;
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

        if (hasValidEvalData) walk(tree, evalData, []);
        return map;
    }, [evalData, hasValidEvalData, tree]);

    const currentSelectedEval = useMemo(() => {
        if (!hasValidEvalData || selection.index < 0) return null;
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
            if (prev.variationPath.length > 0) return { index: Math.max(-1, tree.length - 1), variationPath: [] };
            return prev;
        });
    }, [tree]);

    const goPrev = useCallback(() => {
        setSelection((prev) => {
            if (prev.index > -1) return { ...prev, index: prev.index - 1 };
            if (prev.variationPath.length > 0) return { index: -1, variationPath: [] };
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

    function renderLine(line, path = [], moveNoStart = 1) {
        let moveNo = moveNoStart;
        return (
            <span>
                {line.map((node, i) => {
                    const key = `${path.join('|') || 'main'}:${i}`;
                    const selected = selection.index === i
                        && selection.variationPath.length === path.length
                        && selection.variationPath.every((x, idx) => x === path[idx]);
                    const evalValue = hasValidEvalData ? pathToEval.get(key) : null;
                    const color = selected ? '#101010' : hasValidEvalData ? colorFromEval(evalValue, userColor) : '#e6e6e6';
                    const background = selected ? '#f6d94d' : 'transparent';
                    const showMoveNo = (i % 2) === 0;
                    const moveLabel = showMoveNo ? `${moveNo}. ` : '';
                    if (!showMoveNo) moveNo += 1;

                    return (
                        <span key={key}>
                            <button
                                type="button"
                                onClick={() => setSelection({ index: i, variationPath: clonePath(path) })}
                                style={{
                                    border: 'none',
                                    background,
                                    color,
                                    borderRadius: 6,
                                    padding: '2px 6px',
                                    marginRight: 4,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                {moveLabel}
                                {node.san}
                            </button>
                            {node.variations.map((variation, vIdx) => (
                                <span key={`${key}-var-${vIdx}`} style={{ color: '#b8b8b8', marginRight: 6 }}>
                                    ( {renderLine(variation, [...path, `${i}:${vIdx}`], moveNo)} )
                                </span>
                            ))}
                        </span>
                    );
                })}
            </span>
        );
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
                position: 'relative',
            }}>
                {loading ? (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(10, 12, 17, 0.72)',
                        borderRadius: 10,
                    }}>
                        <div className="spinner" />
                    </div>
                ) : null}
                {tree.length > 0 ? renderLine(tree) : <span style={{ color: '#aab3c2' }}>Paste a PGN and click Update PGN.</span>}
            </div>

            <div style={{ marginTop: 12, color: '#d0d7e5', fontSize: 14 }}>
                <strong>Selected move eval:</strong>{' '}
                {currentSelectedEval === null ? 'N/A (initial position or no valid eval format)' : currentSelectedEval}
            </div>

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
