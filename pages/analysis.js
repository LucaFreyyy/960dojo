import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import PositionDisplay from '../components/PositionDisplay';
import SectionTitle from '../components/SectionTitle';
import BackrankInput from '../components/BackrankInput';
import AnalysisCommentBox from '../components/AnalysisCommentBox';
import { positionNrToStartFen } from '../lib/chess960';
import STARTING_POSITIONS from '../lib/chess960Positions.json';
import { Chess } from '../lib/chessCompat';
import { applyBoardMoveToChessGame } from '../lib/openingsGame';
import { analyzeFenCpWhiteStream } from '../lib/stockfishUtils';
import { parsePgnTree } from '../lib/moveListEval';

const EXAMPLE_BACKRANK = 'bbnnrkqr';
const MAX_DEPTH_CAP = 50;
const BASE_DEPTH_LIMIT = 20;
const DEPTH_UNLOCK_STEP = 5;

function buildStartFenFromBackrank(backrank) {
  const white = backrank.toUpperCase();
  const black = backrank.toLowerCase();
  return `${black}/pppppppp/8/8/8/8/PPPPPPPP/${white} w KQkq - 0 1`;
}

function isValidBackrank(backrank) {
  if (typeof backrank !== 'string' || backrank.length !== 8) return false;
  if (!/^[rnbqk]+$/i.test(backrank)) return false;
  const s = backrank.toLowerCase();
  const chars = [...s];
  const count = (c) => chars.filter((x) => x === c).length;
  if (count('k') !== 1 || count('q') !== 1 || count('r') !== 2 || count('b') !== 2 || count('n') !== 2) {
    return false;
  }
  const rookIdx = chars.map((c, i) => (c === 'r' ? i : -1)).filter((i) => i >= 0);
  const kingIdx = chars.indexOf('k');
  if (kingIdx <= rookIdx[0] || kingIdx >= rookIdx[1]) return false;
  const bishopIdx = chars.map((c, i) => (c === 'b' ? i : -1)).filter((i) => i >= 0);
  if ((bishopIdx[0] % 2) === (bishopIdx[1] % 2)) return false;
  return true;
}

function extract960StartingBackrankFromFen(fen) {
  if (typeof fen !== 'string' || !fen.trim()) return null;
  const board = fen.trim().split(/\s+/)[0];
  const ranks = board.split('/');
  if (ranks.length !== 8) return null;
  const [r8, r7, r6, r5, r4, r3, r2, r1] = ranks;
  if (r7 !== 'pppppppp' || r6 !== '8' || r5 !== '8' || r4 !== '8' || r3 !== '8' || r2 !== 'PPPPPPPP') {
    return null;
  }
  const backrank = String(r8 || '').toLowerCase();
  if (!isValidBackrank(backrank)) return null;
  if (String(r1 || '') !== backrank.toUpperCase()) return null;
  return backrank;
}

function buildNumberToBackrankMap() {
  const m = new Map();
  for (let n = 0; n < 960; n += 1) {
    const key = String(n).padStart(3, '0');
    const rank = STARTING_POSITIONS[key];
    if (rank) m.set(n, rank.toLowerCase());
  }
  return m;
}

function buildBackrankToNumberMap(numberToBackrank) {
  const m = new Map();
  numberToBackrank.forEach((rank, nr) => m.set(rank, nr));
  return m;
}

function createLine() {
  const line = [];
  line.rootComment = '';
  return line;
}

function cloneLine(line) {
  const out = createLine();
  out.rootComment = String(line?.rootComment || '');
  for (const n of (line || [])) {
    out.push({
      san: n.san,
      comment: n.comment || '',
      variations: (n.variations || []).map(cloneLine),
    });
  }
  return out;
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

function buildPgnFromTree(startFen, mainline) {
  function renderLine(line, plyStart, path) {
    let ply = plyStart;
    const out = [];
    for (let i = 0; i < line.length; i += 1) {
      const node = line[i];
      const moveNo = Math.floor(ply / 2) + 1;
      const whiteToMove = ply % 2 === 0;
      const comment = node.comment ? ` {${String(node.comment).replace(/\}/g, '').trim()}}` : '';
      out.push(whiteToMove ? `${moveNo}. ${node.san}${comment}` : `${node.san}${comment}`);
      const childPlyStart = ply + 1;
      for (let v = 0; v < node.variations.length; v += 1) {
        const varText = renderLine(node.variations[v], childPlyStart, [...path, `${i}:${v}`]);
        if (varText) out.push(`(${varText})`);
      }
      ply += 1;
    }
    return out.join(' ');
  }
  const rootComment = String(mainline?.rootComment || '').trim();
  const prefix = rootComment ? `{${rootComment.replace(/\}/g, '').trim()}} ` : '';
  const movetext = `${prefix}${renderLine(mainline, 0, [])}`.trim();
  return [
    '[Event "960 Dojo Analysis"]',
    '[Variant "Chess960"]',
    `[FEN "${startFen}"]`,
    '[SetUp "1"]',
    '',
    movetext,
  ].join('\n').trim();
}

function buildEvalDataFromMap(tree, evalByKey) {
  if (!Array.isArray(tree)) return [null];
  function buildFromLine(line, path, includeInitial) {
    const arr = includeInitial ? [evalByKey.get('main:initial') ?? null] : [];
    for (let i = 0; i < line.length; i += 1) {
      const key = `${path.join('|') || 'main'}:${i}`;
      arr.push(evalByKey.get(key) ?? null);
      for (let v = 0; v < line[i].variations.length; v += 1) {
        arr.push(buildFromLine(line[i].variations[v], [...path, `${i}:${v}`], false));
      }
    }
    return arr;
  }
  return buildFromLine(tree, [], true);
}

function getPositionAtSelection(startFen, mainline, selection) {
  const game = new Chess(startFen, { chess960: true });
  let last = null;
  const path = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
  for (let p = 0; p < path.length; p += 1) {
    const seg = path[p];
    const [miRaw, viRaw] = String(seg).split(':');
    const mi = Number(miRaw);
    const vi = Number(viRaw);
    const parent = getLineByPath(mainline, path.slice(0, p));
    for (let i = 0; i <= mi; i += 1) {
      const n = parent[i];
      if (!n) break;
      last = game.move(n.san, { sloppy: true }) || last;
    }
    const anchor = parent[mi];
    const varLine = anchor?.variations?.[vi] || [];
    if (p < path.length - 1) {
      const nextSeg = path[p + 1];
      const [nextMiRaw] = String(nextSeg).split(':');
      const nextMi = Number(nextMiRaw);
      for (let i = 0; i <= nextMi && i < varLine.length; i += 1) {
        last = game.move(varLine[i].san, { sloppy: true }) || last;
      }
    }
  }
  const line = getLineByPath(mainline, path);
  const index = Number.isInteger(selection?.index) ? selection.index : -1;
  for (let i = 0; i <= index && i < line.length; i += 1) {
    last = game.move(line[i].san, { sloppy: true }) || last;
  }
  const lastMove = last?.from && last?.to ? [last.from, last.to] : undefined;
  return { fen: game.fen(), lastMove };
}

export default function AnalysisPage() {
  const numberToBackrank = useMemo(buildNumberToBackrankMap, []);
  const backrankToNumber = useMemo(() => buildBackrankToNumberMap(numberToBackrank), [numberToBackrank]);

  const [positionNr, setPositionNr] = useState(0);
  const [backrankInput, setBackrankInput] = useState(numberToBackrank.get(0) || EXAMPLE_BACKRANK);
  const [startFen, setStartFen] = useState(positionNrToStartFen(0));
  const [fenInput, setFenInput] = useState(positionNrToStartFen(0));
  const [pgnInput, setPgnInput] = useState('');
  const [mainline, setMainline] = useState(createLine());
  const [selection, setSelection] = useState({ index: -1, variationPath: [] });
  const [currentFen, setCurrentFen] = useState(positionNrToStartFen(0));
  const [lastMove, setLastMove] = useState(undefined);
  const [infoMessage, setInfoMessage] = useState('');
  const [engineOn, setEngineOn] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);
  const [depthLimit, setDepthLimit] = useState(BASE_DEPTH_LIMIT);
  const [depthReached, setDepthReached] = useState(0);
  const [engineEvalCp, setEngineEvalCp] = useState(null);
  const [evalByKey, setEvalByKey] = useState(new Map());
  const [depthByKey, setDepthByKey] = useState(new Map());
  const [moveCommentDraft, setMoveCommentDraft] = useState('');
  const engineCancelRef = useRef(null);
  const engineStateRef = useRef({ key: null, depth: 0, cpWhite: null });

  const treePgn = useMemo(() => buildPgnFromTree(startFen, mainline), [startFen, mainline]);
  const moveListEvalData = useMemo(() => buildEvalDataFromMap(mainline, evalByKey), [mainline, evalByKey]);

  const syncFromPositionNr = useCallback((nr) => {
    const safe = Math.max(0, Math.min(959, Number(nr) || 0));
    const rank = numberToBackrank.get(safe);
    if (!rank) return;
    const nextFen = positionNrToStartFen(safe);
    const samePosition = safe === positionNr && nextFen === startFen;
    if (samePosition) {
      setPositionNr(safe);
      setBackrankInput(rank);
      return;
    }
    setPositionNr(safe);
    setBackrankInput(rank);
    setStartFen(nextFen);
    setFenInput(nextFen);
    setMainline(createLine());
    setSelection({ index: -1, variationPath: [] });
    setCurrentFen(nextFen);
    setLastMove(undefined);
    setEvalByKey(new Map());
    setDepthByKey(new Map());
    setDepthReached(0);
    setEngineEvalCp(null);
    engineStateRef.current = { key: null, depth: 0, cpWhite: null };
    setInfoMessage('');
  }, [numberToBackrank, positionNr, startFen]);

  useEffect(() => {
    setPgnInput(treePgn);
  }, [treePgn]);

  useEffect(() => {
    setFenInput(currentFen || '');
  }, [currentFen]);

  useEffect(() => {
    const { fen, lastMove: lm } = getPositionAtSelection(startFen, mainline, selection);
    setCurrentFen(fen);
    setLastMove(lm);
  }, [startFen, mainline, selection]);

  const selectedNode = useMemo(() => {
    const path = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
    const line = getLineByPath(mainline, path);
    const idx = Number.isInteger(selection?.index) ? selection.index : -1;
    if (idx < 0) return null;
    return line[idx] || null;
  }, [mainline, selection]);

  const selectedLine = useMemo(() => {
    const path = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
    return getLineByPath(mainline, path);
  }, [mainline, selection]);

  useEffect(() => {
    if (selectedNode) {
      setMoveCommentDraft(selectedNode.comment || '');
    } else {
      setMoveCommentDraft(String(selectedLine?.rootComment || ''));
    }
  }, [selectedNode, selectedLine]);

  const persistSelectedComment = useCallback((raw) => {
    const path = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
    const idx = Number.isInteger(selection?.index) ? selection.index : -1;
    const nextText = String(raw || '');
    setMainline((prev) => {
      const next = cloneLine(prev);
      const line = getLineByPath(next, path);
      if (idx < 0) {
        line.rootComment = nextText;
        return next;
      }
      if (!line[idx]) return prev;
      line[idx].comment = nextText;
      return next;
    });
  }, [selection]);

  const handleBrowsePositionChanged = useCallback((index, variationPath) => {
    setSelection((prev) => {
      const nextPath = Array.isArray(variationPath) ? variationPath : [];
      const sameIndex = prev.index === index;
      const samePath =
        prev.variationPath.length === nextPath.length &&
        prev.variationPath.every((x, i) => x === nextPath[i]);
      if (sameIndex && samePath) return prev;
      return { index, variationPath: nextPath };
    });
  }, []);

  const applyBackrank = useCallback(() => {
    const raw = backrankInput.trim().toLowerCase();
    if (!isValidBackrank(raw)) {
      setInfoMessage(`Invalid back rank. Example: ${EXAMPLE_BACKRANK}`);
      return;
    }
    const nr = backrankToNumber.get(raw);
    const nextFen = buildStartFenFromBackrank(raw);
    const nextNr = Number.isInteger(nr) ? nr : positionNr;
    const samePosition = nextFen === startFen;
    if (samePosition) {
      setPositionNr(nextNr);
      setBackrankInput(raw);
      setInfoMessage('');
      return;
    }
    setPositionNr(Number.isInteger(nr) ? nr : 0);
    setStartFen(nextFen);
    setMainline(createLine());
    setSelection({ index: -1, variationPath: [] });
    setCurrentFen(nextFen);
    setLastMove(undefined);
    setEvalByKey(new Map());
    setDepthByKey(new Map());
    setDepthReached(0);
    setEngineEvalCp(null);
    engineStateRef.current = { key: null, depth: 0, cpWhite: null };
    setInfoMessage('');
  }, [backrankInput, backrankToNumber, positionNr, startFen]);

  const onBoardMove = useCallback(({ from, to, san }) => {
    setMainline((prev) => {
      const next = cloneLine(prev);
      const path = Array.isArray(selection.variationPath) ? selection.variationPath : [];
      const line = getLineByPath(next, path);
      const game = new Chess(currentFen, { chess960: true });
      const mv = applyBoardMoveToChessGame(game, from, to, san);
      if (!mv) return prev;

      const index = Number.isInteger(selection.index) ? selection.index : -1;
      const moveSan = mv.san;
      if (index === line.length - 1) {
        line.push({ san: moveSan, comment: '', variations: [] });
        setSelection({ index: line.length - 1, variationPath: path });
      } else if (index >= 0 && line[index]) {
        const anchor = line[index];
        const existingVarIdx = anchor.variations.findIndex((vline) => vline[0]?.san === moveSan);
        if (existingVarIdx >= 0) {
          setSelection({ index: 0, variationPath: [...path, `${index}:${existingVarIdx}`] });
        } else {
          anchor.variations.push([{ san: moveSan, comment: '', variations: [] }]);
          setSelection({ index: 0, variationPath: [...path, `${index}:${anchor.variations.length - 1}`] });
        }
      } else if (index === -1) {
        if (!line.length) {
          line.push({ san: moveSan, comment: '', variations: [] });
          setSelection({ index: 0, variationPath: path });
        } else if (line[0]?.san === moveSan) {
          setSelection({ index: 0, variationPath: path });
        } else {
          line[0].variations.push([{ san: moveSan, comment: '', variations: [] }]);
          setSelection({ index: 0, variationPath: [`0:${line[0].variations.length - 1}`] });
        }
      }

      return next;
    });
  }, [currentFen, selection]);

  useEffect(() => {
    const selectionKey = selection.index < 0
      ? 'main:initial'
      : `${(selection.variationPath || []).join('|') || 'main'}:${selection.index}`;
    const knownDepth = depthByKey.get(selectionKey) || 0;
    const knownEvalPawns = evalByKey.get(selectionKey);
    const isSameEngineKey = engineStateRef.current.key === selectionKey;
    const bootDepth = isSameEngineKey
      ? Math.max(knownDepth, engineStateRef.current.depth || 0)
      : knownDepth;
    setDepthReached(bootDepth);
    if (Number.isFinite(knownEvalPawns)) {
      setEngineEvalCp(knownEvalPawns * 100);
    } else if (!isSameEngineKey) {
      setEngineEvalCp(null);
    }

    if (!engineOn || !currentFen) {
      setEngineRunning(false);
      return;
    }
    if (knownDepth >= depthLimit) {
      setEngineRunning(false);
      return;
    }

    if (engineCancelRef.current) engineCancelRef.current();
    setEngineRunning(true);
    const cancel = analyzeFenCpWhiteStream(currentFen, depthLimit, {
      onInfo: ({ depth, cpWhite }) => {
        const infoDepth = Math.max(bootDepth, depth || 0);
        setDepthReached((d) => Math.max(d, infoDepth));
        setDepthByKey((prev) => {
          const next = new Map(prev);
          next.set(selectionKey, Math.max(next.get(selectionKey) || 0, infoDepth));
          return next;
        });
        engineStateRef.current = { key: selectionKey, depth: infoDepth, cpWhite };
        if (Number.isFinite(cpWhite)) {
          setEngineEvalCp(cpWhite);
          setEvalByKey((prev) => {
            const next = new Map(prev);
            next.set(selectionKey, cpWhite / 100);
            return next;
          });
        }
      },
      onDone: ({ depth, cpWhite }) => {
        setEngineRunning(false);
        const finalDepth = Math.max(bootDepth, depth || 0);
        setDepthReached((d) => Math.max(d, finalDepth));
        setDepthByKey((prev) => {
          const next = new Map(prev);
          next.set(selectionKey, Math.max(next.get(selectionKey) || 0, finalDepth));
          return next;
        });
        if (Number.isFinite(cpWhite)) {
          setEngineEvalCp(cpWhite);
          setEvalByKey((prev) => {
            const next = new Map(prev);
            next.set(selectionKey, cpWhite / 100);
            return next;
          });
        }
        engineStateRef.current = { key: selectionKey, depth: finalDepth, cpWhite };
      },
    });
    engineCancelRef.current = cancel;
    return () => {
      if (engineCancelRef.current) engineCancelRef.current();
      setEngineRunning(false);
    };
  }, [engineOn, currentFen, depthLimit, selection]);

  const canUnlockDepth = depthLimit < MAX_DEPTH_CAP && depthReached >= depthLimit && depthLimit >= BASE_DEPTH_LIMIT;

  const importFen = useCallback(() => {
    const raw = fenInput.trim();
    if (!raw) return;
    try {
      const g = new Chess(raw, { chess960: true });
      const checkedFen = g.fen();
      const backrank = extract960StartingBackrankFromFen(checkedFen);
      setStartFen(checkedFen);
      if (backrank) {
        const mappedNr = backrankToNumber.get(backrank);
        if (Number.isInteger(mappedNr)) setPositionNr(mappedNr);
        setBackrankInput(backrank);
      }
      setMainline(createLine());
      setSelection({ index: -1, variationPath: [] });
      setCurrentFen(checkedFen);
      setLastMove(undefined);
      setEvalByKey(new Map());
      setDepthByKey(new Map());
      setEngineEvalCp(null);
      setDepthReached(0);
      engineStateRef.current = { key: null, depth: 0, cpWhite: null };
      setInfoMessage('Imported FEN.');
    } catch {
      setInfoMessage('Invalid FEN.');
    }
  }, [fenInput, backrankToNumber]);

  const importPgn = useCallback(() => {
    const raw = pgnInput.trim();
    if (!raw) return;
    let importedStartFen = null;
    const fenTagMatch = raw.match(/\[FEN\s+"([^"]+)"\]/i);
    if (fenTagMatch?.[1]) {
      try {
        const gFen = new Chess(fenTagMatch[1], { chess960: true });
        importedStartFen = gFen.fen();
        setStartFen(importedStartFen);
      } catch {}
    }
    const backrank = importedStartFen ? extract960StartingBackrankFromFen(importedStartFen) : null;
    if (backrank) {
      const mappedNr = backrankToNumber.get(backrank);
      if (Number.isInteger(mappedNr)) setPositionNr(mappedNr);
      setBackrankInput(backrank);
    }
    const tree = parsePgnTree(raw);
    setMainline(tree);
    setSelection({ index: Math.max(-1, tree.length - 1), variationPath: [] });
    setEvalByKey(new Map());
    setDepthByKey(new Map());
    setDepthReached(0);
    setEngineEvalCp(null);
    engineStateRef.current = { key: null, depth: 0, cpWhite: null };
    setInfoMessage('Imported PGN.');
  }, [pgnInput, backrankToNumber]);

  return (
    <>
      <Head>
        <title>Analysis - 960 Dojo</title>
      </Head>
      <main className="page-shell openings-page">
        <SectionTitle title="Analysis" />
        {infoMessage ? <div className="alert alert--info mb-sm">{infoMessage}</div> : null}

        <div className="openings-layout">
          <div className="openings-col-board">
            <div className="training-chessboard">
              <Chessboard
                fen={currentFen}
                orientation="white"
                onMove={onBoardMove}
                lastMove={lastMove}
              />
            </div>
            <div className="openings-board-head">
              <PositionDisplay value={positionNr} editable onChange={syncFromPositionNr} />
            </div>
            <BackrankInput
              value={backrankInput}
              onChange={setBackrankInput}
              onApply={applyBackrank}
              example={EXAMPLE_BACKRANK}
            />
          </div>

          <div className="openings-col-side">
            <div className="analysis-engine-row">
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => setEngineOn((v) => !v)}
              >
                {engineOn ? 'Engine: On' : 'Engine: Off'}
              </button>
              <span className="analysis-engine-depth">Depth {depthReached || 0}</span>
              {canUnlockDepth ? (
                <button
                  type="button"
                  className="btn btn--sm btn--secondary"
                  onClick={() => setDepthLimit((d) => Math.min(MAX_DEPTH_CAP, d + DEPTH_UNLOCK_STEP))}
                >
                  +
                </button>
              ) : null}
              <span className="analysis-engine-eval">
                {Number.isFinite(engineEvalCp) ? `Eval ${(engineEvalCp / 100).toFixed(2)}` : ''}
              </span>
            </div>
            <MoveList
              className="move-list--openings"
              pgn={treePgn}
              evalData={moveListEvalData}
              allowSparseEvalData
              userColor="white"
              loading={engineRunning}
              loadingMessage="Engine analyzing..."
              selectedPosition={selection}
              resetSelectionOnPgnChange={false}
              onBrowsePositionChanged={handleBrowsePositionChanged}
            />
            <AnalysisCommentBox
              value={moveCommentDraft}
              disabled={false}
              onChange={(v) => {
                setMoveCommentDraft(v);
                persistSelectedComment(v);
              }}
            />
          </div>
        </div>

        <section className="analysis-import-export">
          <h3 className="analysis-subtitle">Import / Export</h3>
          <label className="analysis-label" htmlFor="analysis-fen">FEN</label>
          <textarea
            id="analysis-fen"
            className="analysis-textarea"
            rows={2}
            value={fenInput}
            onChange={(e) => setFenInput(e.target.value)}
          />
          <div className="analysis-actions">
            <button type="button" className="btn btn--sm btn--secondary" onClick={importFen}>Import FEN</button>
          </div>
          <label className="analysis-label" htmlFor="analysis-pgn">PGN</label>
          <textarea
            id="analysis-pgn"
            className="analysis-textarea"
            rows={8}
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
          />
          <div className="analysis-actions">
            <button type="button" className="btn btn--sm btn--secondary" onClick={importPgn}>Import PGN</button>
          </div>
        </section>
      </main>
    </>
  );
}
