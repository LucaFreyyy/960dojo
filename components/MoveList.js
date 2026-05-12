import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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

function pathStartsWith(path, prefix) {
    const a = Array.isArray(path) ? path : [];
    const b = Array.isArray(prefix) ? prefix : [];
    if (b.length > a.length) return false;
    for (let i = 0; i < b.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function getLineByPath(mainline, variationPath) {
    let line = mainline;
    for (const segment of variationPath) {
        const [moveIndexRaw, varIndexRaw] = String(segment).split(':');
        if (moveIndexRaw === 'root') {
            const rootLine = mainline?.rootVariations?.[Number(varIndexRaw)];
            if (!rootLine) return [];
            line = rootLine;
            continue;
        }
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
    if (anchorMoveRaw === 'root') return { index: -1, variationPath: [] };
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

const MoveList = forwardRef(function MoveList(
    {
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
        /** Optional click handler for engine lines: `(rank) => void` */
        onEngineLineClick = null,
        /** Optional content displayed on right side of the nav row (analysis board flip). */
        navRight = null,
        onPromoteVariation = null,
        onDemoteVariation = null,
        canPromoteVariation = null,
        canDemoteVariation = null,
        onMakeVariationMainline = null,
        onDeleteFromMove = null,
        /** When true, non-active variations collapse to summary tokens. */
        collapseVariations = false,
        /** Optional callback: `(san | null) => void` when a variation choice is preselected. */
        onVariationPreselectSan = null,
    },
    ref
) {
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
    const [contextMenu, setContextMenu] = useState(null);
    const [variationPreselect, setVariationPreselect] = useState(null);
    const suppressNextBrowseCallbackRef = useRef(false);
    const bodyRef = useRef(null);

    const moveListKeyForSelection = useCallback((index, variationPath) => {
        const path = Array.isArray(variationPath) ? variationPath : [];
        return `${path.join('|') || 'main'}:${index}`;
    }, []);

    useLayoutEffect(() => {
        const container = bodyRef.current;
        if (!container) return;
        if (selection.index < 0) {
            container.scrollTop = 0;
            return;
        }
        const moveKey = moveListKeyForSelection(selection.index, selection.variationPath);
        const el = container.querySelector(`[data-move-list-key=${JSON.stringify(moveKey)}]`);
        if (!el) return;
        const relativeTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
        container.scrollTop = relativeTop;
    }, [moveListKeyForSelection, selection, tree]);
    useEffect(() => {
        if (!contextMenu) return undefined;
        const close = () => setContextMenu(null);
        const onKeyDown = (event) => {
            if (event.key === 'Escape') close();
        };
        window.addEventListener('mousedown', close);
        window.addEventListener('scroll', close, true);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('mousedown', close);
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [contextMenu]);


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

        function walk(line, evalLine, path, startCursor = null) {
            let evalCursor = Number.isInteger(startCursor) ? startCursor : (path.length === 0 ? 1 : 0);
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
            let evalCursor = 1;
            for (let v = 0; v < (tree?.rootVariations || []).length; v += 1) {
                const nextEvalLine = Array.isArray(evalData) ? evalData[evalCursor] : undefined;
                walk(tree.rootVariations[v], nextEvalLine, [`root:${v}`]);
                evalCursor += 1;
            }
            walk(tree, evalData, [], evalCursor);
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
        for (let v = 0; v < (tree?.rootVariations || []).length; v += 1) {
            walk(tree.rootVariations[v], [`root:${v}`], 0);
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
        const [headRaw] = String(path[0]).split(':');
        if (headRaw === 'root') {
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
    const selectionPathKey = useMemo(() => selection.variationPath.join('|'), [selection.variationPath]);

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

    const forkChoices = useMemo(() => {
        if (!selection) return null;
        if (selection.index < 0) {
            if ((selection.variationPath || []).length > 0) return null;
            const choices = [];
            if (tree[0]) {
                choices.push({
                    kind: 'main',
                    index: 0,
                    variationPath: [],
                    key: 'main:0',
                    san: String(tree[0]?.san || ''),
                });
            }
            (tree?.rootVariations || []).forEach((vline, vIdx) => {
                if (!vline || !vline[0]) return;
                const vp = [`root:${vIdx}`];
                choices.push({
                    kind: 'var',
                    index: 0,
                    variationPath: vp,
                    key: `${vp.join('|')}:${0}`,
                    san: String(vline?.[0]?.san || ''),
                });
            });
            if (choices.length < 2) return null;
            return {
                anchorIndex: -1,
                anchorPath: [],
                choices,
            };
        }
        const line = getLineByPath(tree, selection.variationPath);
        const anchor = line?.[selection.index];
        if (!anchor) return null;
        const choices = [];
        if (line[selection.index + 1]) {
            choices.push({
                kind: 'main',
                index: selection.index + 1,
                variationPath: clonePath(selection.variationPath),
                key: `${(selection.variationPath || []).join('|') || 'main'}:${selection.index + 1}`,
                san: String(line[selection.index + 1]?.san || ''),
            });
        }
        (anchor.variations || []).forEach((vline, vIdx) => {
            if (!vline || !vline[0]) return;
            const vp = [...clonePath(selection.variationPath), `${selection.index}:${vIdx}`];
            choices.push({
                kind: 'var',
                index: 0,
                variationPath: vp,
                key: `${vp.join('|')}:${0}`,
                san: String(vline?.[0]?.san || ''),
            });
        });
        if (choices.length < 2) return null;
        return {
            anchorIndex: selection.index,
            anchorPath: clonePath(selection.variationPath),
            choices,
        };
    }, [selection, tree]);

    const variationChoiceMap = useMemo(() => {
        const map = new Map();
        if (!forkChoices) return map;
        for (let i = 0; i < forkChoices.choices.length; i += 1) {
            const c = forkChoices.choices[i];
            map.set(c.key, { choiceIndex: i, kind: c.kind });
        }
        return map;
    }, [forkChoices]);

    const preselectedVariationPath = useMemo(() => {
        if (!variationPreselect || !forkChoices) return null;
        const idx = Number.isInteger(variationPreselect.cursor) ? variationPreselect.cursor : -1;
        if (idx < 0 || idx >= forkChoices.choices.length) return null;
        const choice = forkChoices.choices[idx];
        if (choice?.kind !== 'var') return null;
        return Array.isArray(choice.variationPath) ? choice.variationPath : null;
    }, [forkChoices, variationPreselect]);

    useEffect(() => {
        // Changing selection should clear any pending preselect.
        setVariationPreselect(null);
    }, [selection.index, selectionPathKey]);

    useEffect(() => {
        if (typeof onVariationPreselectSan !== 'function') return;
        if (!variationPreselect || !forkChoices) {
            onVariationPreselectSan(null);
            return;
        }
        const idx = Number.isInteger(variationPreselect.cursor) ? variationPreselect.cursor : -1;
        const choice = idx >= 0 && idx < forkChoices.choices.length ? forkChoices.choices[idx] : null;
        const san = choice?.san ? String(choice.san) : null;
        onVariationPreselectSan(san && san.trim() ? san : null);
    }, [forkChoices, onVariationPreselectSan, variationPreselect]);

    const commitVariationPreselect = useCallback((cursor) => {
        if (!forkChoices) return false;
        const idx = Number.isInteger(cursor) ? cursor : -1;
        if (idx < 0 || idx >= forkChoices.choices.length) return false;
        const target = forkChoices.choices[idx];
        setSelection({ index: target.index, variationPath: clonePath(target.variationPath) });
        setVariationPreselect(null);
        return true;
    }, [forkChoices]);

    useImperativeHandle(
        ref,
        () => ({
            stepPrevious: () => {
                goPrev();
            },
            stepNext: () => {
                goNext();
            },
        }),
        [goNext, goPrev]
    );

    useEffect(() => {
        function onKeyDown(event) {
            const t = event.target;
            const tag = t && typeof t.tagName === 'string' ? t.tagName.toLowerCase() : '';
            const isTypingTarget =
                tag === 'input'
                || tag === 'textarea'
                || (t && typeof t.isContentEditable === 'boolean' && t.isContentEditable);
            if (isTypingTarget) return;

            if (event.key === 'Escape') {
                if (variationPreselect) {
                    event.preventDefault();
                    setVariationPreselect(null);
                }
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                if (!forkChoices) return;
                setVariationPreselect((prev) => {
                    const base = prev && prev.anchorIndex === forkChoices.anchorIndex
                        && prev.anchorPath.length === forkChoices.anchorPath.length
                        && prev.anchorPath.every((x, i) => x === forkChoices.anchorPath[i])
                        ? prev
                        : { anchorIndex: forkChoices.anchorIndex, anchorPath: forkChoices.anchorPath, cursor: 0 };
                    const dir = event.key === 'ArrowUp' ? -1 : +1;
                    const nextCursor = (base.cursor + dir + forkChoices.choices.length) % forkChoices.choices.length;
                    return { ...base, cursor: nextCursor };
                });
            } else if (event.key === 'Enter') {
                if (variationPreselect && forkChoices) {
                    event.preventDefault();
                    commitVariationPreselect(variationPreselect.cursor);
                }
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                if (variationPreselect) setVariationPreselect(null);
                else goPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                if (variationPreselect && forkChoices) {
                    commitVariationPreselect(variationPreselect.cursor);
                } else {
                    goNext();
                }
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [commitVariationPreselect, forkChoices, goNext, goPrev, variationPreselect]);

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
        const choiceMeta = variationChoiceMap.get(key);
        const isForkChoice = Boolean(choiceMeta);
        const preselectActive = Boolean(
            isForkChoice
            && variationPreselect
            && forkChoices
            && variationPreselect.anchorIndex === forkChoices.anchorIndex
            && variationPreselect.anchorPath.length === forkChoices.anchorPath.length
            && variationPreselect.anchorPath.every((x, i) => x === forkChoices.anchorPath[i])
            && variationPreselect.cursor === choiceMeta.choiceIndex
        );
        const forkChoiceClass = isForkChoice ? 'move-btn--variation-choice' : '';
        const forkActiveClass = preselectActive ? 'move-btn--variation-choice-active' : '';

        const canPromote = typeof onPromoteVariation === 'function'
            && (typeof canPromoteVariation === 'function' ? canPromoteVariation(path, index) : path.length > 0);
        const canDemote = typeof onDemoteVariation === 'function'
            && (typeof canDemoteVariation === 'function' ? canDemoteVariation(path, index) : path.length > 0);
        const canMainline = path.length > 0 && typeof onMakeVariationMainline === 'function';
        const canDelete = typeof onDeleteFromMove === 'function';
        return (
            <button
                type="button"
                data-move-list-key={key}
                onClick={() => setSelection({ index, variationPath: clonePath(path) })}
                onContextMenu={(event) => {
                    if (!canPromote && !canDemote && !canMainline && !canDelete) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setContextMenu({
                        x: event.clientX,
                        y: event.clientY,
                        index,
                        variationPath: clonePath(path),
                        canPromote,
                        canDemote,
                        canMainline,
                        canDelete,
                    });
                }}
                className={`move-btn ${fullWidth ? 'move-btn--full' : 'move-btn--inline'} ${toneClass} ${selectedClass} ${forkChoiceClass} ${forkActiveClass}`.trim()}
                data-variation-choice={isForkChoice ? choiceMeta.kind : undefined}
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
        const selectedPath = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
        return (
            <div className="move-list__var-line">
                {line.map((node, i) => {
                    const segmentPath = [...path];
                    const key = `${segmentPath.join('|') || 'main'}:${i}`;
                    const plyBefore = pathToPlyBefore.get(key);
                    const ply = Number.isInteger(plyBefore) ? plyBefore : null;
                    const isWhiteMove = ply != null ? (ply % 2) === 0 : (i % 2) === 0;
                    const computedMoveNo = ply != null ? Math.floor(ply / 2) + 1 : moveNo;
                    const showMoveNo = isWhiteMove;
                    const showEllipses = !isWhiteMove && i === 0;
                    const moveLabel = showMoveNo
                        ? `${computedMoveNo}. `
                        : showEllipses
                            ? `${computedMoveNo}... `
                            : '';
                    if (!isWhiteMove && ply == null) moveNo += 1;

                    return (
                        <span key={`${segmentPath.join('|') || 'main'}:${i}`} className="move-list__var-move">
                            {renderMoveButton(node, i, segmentPath, moveLabel)}
                            <span className="move-list__spacer-sm" />
                            {node.variations.map((variation, vIdx) => {
                                const varPath = [...segmentPath, `${i}:${vIdx}`];
                                const isActive = pathStartsWith(selectedPath, varPath);
                                const isPreselected =
                                    preselectedVariationPath
                                    && preselectedVariationPath.length === varPath.length
                                    && preselectedVariationPath.every((x, j) => x === varPath[j]);
                                if (!collapseVariations || isActive || isPreselected) {
                                    return (
                                        <div key={`${segmentPath.join('|')}:${i}:var-${vIdx}`} className="move-list__var-branch">
                                            <span className="move-list__var-paren">(</span>
                                            {renderVariationLine(variation, varPath, moveNo)}
                                            <span className="move-list__var-paren">)</span>
                                        </div>
                                    );
                                }

                                const firstSan = String(variation?.[0]?.san || '').trim();
                                if (!firstSan) return null;
                                const firstKey = `${varPath.join('|')}:0`;
                                const firstPlyBefore = pathToPlyBefore.get(firstKey);
                                const firstPly = Number.isInteger(firstPlyBefore) ? firstPlyBefore : null;
                                const firstMoveNo = firstPly != null ? Math.floor(firstPly / 2) + 1 : computedMoveNo;
                                const firstIsWhite = firstPly != null ? (firstPly % 2) === 0 : true;
                                const prefix = firstIsWhite ? `${firstMoveNo}. ` : `${firstMoveNo}... `;
                                const remaining = Math.max(0, (variation?.length || 0) - 1);

                                // Variations with only one move are already compact; don't collapse them.
                                if (remaining === 0) {
                                    return (
                                        <div key={`${segmentPath.join('|')}:${i}:var-${vIdx}`} className="move-list__var-branch">
                                            <span className="move-list__var-paren">(</span>
                                            {renderVariationLine(variation, varPath, moveNo)}
                                            <span className="move-list__var-paren">)</span>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={`${segmentPath.join('|')}:${i}:var-${vIdx}`}
                                        type="button"
                                        className="move-list__var-collapsed"
                                        onClick={() => setSelection({ index: 0, variationPath: clonePath(varPath) })}
                                        title="Jump to variation"
                                    >
                                        ({prefix}{firstSan}{remaining ? ` [+${remaining}]` : ''})
                                    </button>
                                );
                            })}
                            <span className="move-list__spacer-md" />
                        </span>
                    );
                })}
            </div>
        );
    }

    function renderVariationBlocks(combined, rowKeyPrefix, selectedPath) {
        const blocks = [];
        for (let v = 0; v < combined.length; v += 1) {
            const variation = combined[v];
            const varPath = variation.path;
            const isActive = pathStartsWith(selectedPath, varPath);
            const isPreselected =
                preselectedVariationPath
                && preselectedVariationPath.length === varPath.length
                && preselectedVariationPath.every((x, j) => x === varPath[j]);
            const firstSan = String(variation?.line?.[0]?.san || '').trim();
            const remaining = Math.max(0, (variation?.line?.length || 0) - 1);
            const canCollapse = collapseVariations && !isActive && !isPreselected && remaining > 0 && Boolean(firstSan);

            const collapsedToken = (() => {
                if (!canCollapse) return null;
                const firstKey = `${varPath.join('|')}:0`;
                const firstPlyBefore = pathToPlyBefore.get(firstKey);
                const firstPly = Number.isInteger(firstPlyBefore) ? firstPlyBefore : null;
                const firstMoveNo = firstPly != null ? Math.floor(firstPly / 2) + 1 : variation.moveNo;
                const firstIsWhite = firstPly != null ? (firstPly % 2) === 0 : true;
                const prefix = firstIsWhite ? `${firstMoveNo}. ` : `${firstMoveNo}... `;
                return (
                    <button
                        type="button"
                        className="move-list__var-collapsed"
                        onClick={() => setSelection({ index: 0, variationPath: clonePath(varPath) })}
                        title="Jump to variation"
                    >
                        ({prefix}{firstSan} [+{remaining}])
                    </button>
                );
            })();

            blocks.push(
                <div key={`${rowKeyPrefix}-var-${v}`} className="move-list__variation">
                    {collapsedToken ? collapsedToken : (
                        <>
                            <span className="move-list__var-paren">(</span>{' '}
                            {renderVariationLine(variation.line, variation.path, variation.moveNo)}{' '}
                            <span className="move-list__var-paren">)</span>
                        </>
                    )}
                </div>
            );
        }
        return blocks;
    }

    function renderMainlineRows() {
        const rows = [];
        const selectedPath = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
        const rootVariations = tree?.rootVariations || [];

        if (tree.length === 0 && rootVariations.length > 0) {
            const combined = rootVariations.map((line, vIdx) => ({ line, path: [`root:${vIdx}`], moveNo: 1 }));
            rows.push(...renderVariationBlocks(combined, 'root-only', selectedPath));
            return rows;
        }

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
            const rootEntries = i === 0
                ? rootVariations.map((line, vIdx) => ({ line, path: [`root:${vIdx}`], moveNo: 1 }))
                : [];
            const combined = [
                ...rootEntries,
                ...whiteVariations.map((line, vIdx) => ({ line, path: [`${i}:${vIdx}`], moveNo: moveNumber })),
                ...blackVariations.map((line, vIdx) => ({ line, path: [`${i + 1}:${vIdx}`], moveNo: moveNumber + 1 })),
            ];

            rows.push(...renderVariationBlocks(combined, `main-row-${i}`, selectedPath));
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
                {navRight ? <div className="move-list__nav-right">{navRight}</div> : null}
            </div>

            {Array.isArray(engineBestLines) && engineBestLines.length > 0 ? (
                <div
                    className="move-list__engine-lines"
                    onMouseLeave={() => onEngineLineHover?.(null)}
                >
                    <ol className="move-list__engine-lines-list">
                        {engineBestLines.map((row) => (
                            <li
                                key={row.rank}
                                className="move-list__engine-line"
                                onMouseEnter={() => onEngineLineHover?.(row.rank)}
                                onClick={() => onEngineLineClick?.(row.rank)}
                                style={row.color ? { '--engine-line-color': row.color } : undefined}
                            >
                                <span className="move-list__engine-line-eval">{row.evalText}</span>
                                <span className="move-list__engine-line-pv">{row.pvText}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            ) : null}

            <div ref={bodyRef} className="move-list__body">
                {tree.length > 0 || (tree?.rootVariations || []).length > 0 ? (
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
            {contextMenu ? (
                <div
                    className="move-list__context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {contextMenu.canPromote ? (
                        <button
                            type="button"
                            className="move-list__context-item"
                            onClick={() => {
                                onPromoteVariation?.(contextMenu.variationPath, contextMenu.index);
                                setContextMenu(null);
                            }}
                        >
                            Promote line
                        </button>
                    ) : null}
                    {contextMenu.canDemote ? (
                        <button
                            type="button"
                            className="move-list__context-item"
                            onClick={() => {
                                onDemoteVariation?.(contextMenu.variationPath, contextMenu.index);
                                setContextMenu(null);
                            }}
                        >
                            Demote line
                        </button>
                    ) : null}
                    {contextMenu.canMainline ? (
                        <button
                            type="button"
                            className="move-list__context-item"
                            onClick={() => {
                                onMakeVariationMainline?.(contextMenu.variationPath, contextMenu.index);
                                setContextMenu(null);
                            }}
                        >
                            Make main line
                        </button>
                    ) : null}
                    {contextMenu.canDelete ? (
                        <button
                            type="button"
                            className="move-list__context-item move-list__context-item--danger"
                            onClick={() => {
                                onDeleteFromMove?.(contextMenu.variationPath, contextMenu.index);
                                setContextMenu(null);
                            }}
                        >
                            Delete from here
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});

MoveList.displayName = 'MoveList';

export default MoveList;
