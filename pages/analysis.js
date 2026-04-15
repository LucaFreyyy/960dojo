import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import PositionDisplay from '../components/PositionDisplay';
import SectionTitle from '../components/SectionTitle';
import BackrankInput from '../components/BackrankInput';
import AnalysisCommentBox from '../components/AnalysisCommentBox';
import RatingDisplay from '../components/RatingDisplay';
import { positionNrToStartFen } from '../lib/chess960';
import STARTING_POSITIONS from '../lib/chess960Positions.json';
import { Chess } from '../lib/chessCompat';
import { applyBoardMoveToChessGame } from '../lib/openingsGame';
import { analyzeFenMultipvStream, uciPvToSanString, warmStockfish } from '../lib/stockfishUtils';
import { parsePgnTree } from '../lib/moveListEval';
import { takeAnalysisImportForNonce } from '../lib/analysisSessionImport';
import { useMoveListWheelNavigation } from '../lib/useMoveListWheelNavigation';
import { extractPgnTag } from '../lib/tacticPgnUtils';

const EXAMPLE_BACKRANK = 'bbnnrkqr';
const MAX_DEPTH_CAP = 50;
const BASE_DEPTH_LIMIT = 20;
const DEPTH_UNLOCK_STEP = 5;
const ENGINE_MULTIPV = 5;
const EMPTY_ANALYSIS_DRAWABLE = { analysisAutoShapes: [], analysisDrawableBrushes: {} };

function formatEvalFromCpWhite(cpWhite) {
  if (!Number.isFinite(cpWhite)) return '…';
  const v = cpWhite / 100;
  if (Math.abs(v) > 100) {
    const movesToMate = Math.max(0, Math.round(Math.abs(v) - 100));
    if (movesToMate <= 0) return v < 0 ? '-#' : '#';
    return v < 0 ? `-#${movesToMate}` : `#${movesToMate}`;
  }
  const rounded = Math.round(v * 100) / 100;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function whiteToMoveFromFen(fen) {
  return Boolean(fen && String(fen).trim().split(/\s+/)[1] !== 'b');
}

/** Centipawn quality from the side to move's perspective (higher = better for them). */
function stmQualityCp(cpWhite, whiteToMove) {
  if (!Number.isFinite(cpWhite)) return null;
  return whiteToMove ? cpWhite : -cpWhite;
}

/** How many centipawns worse this line is vs the best engine line (index 0). */
function lossCpVsBestLine(lines, lineIndex, whiteToMove) {
  if (!lines?.length || lineIndex <= 0) return 0;
  const q0 = stmQualityCp(lines[0].cpWhite, whiteToMove);
  const qi = stmQualityCp(lines[lineIndex].cpWhite, whiteToMove);
  if (q0 === null || qi === null) return 0;
  return Math.max(0, q0 - qi);
}

/** Green (best) → yellow → red as loss grows (cap ~100cp for full red shift). */
function lossToEngineBrush(lossCp) {
  const cap = 100;
  const t = Math.min(1, Math.max(0, lossCp / cap));
  const hue = 118 * (1 - t) + 12 * t;
  return {
    color: `hsl(${hue} 74% 40%)`,
    lineColor: `hsl(${hue} 74% 40%)`,
    opacity: 1,
    lineWidth: 10,
  };
}

function engineBrushKey(multipv, lineColor) {
  const safeColor = String(lineColor || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `engl-${multipv}-${safeColor || 'default'}`;
}

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

function parsePgnPlayerPanels(pgnText) {
  const whiteName = extractPgnTag(pgnText, 'White');
  const blackName = extractPgnTag(pgnText, 'Black');
  const whiteEloRaw = extractPgnTag(pgnText, 'WhiteElo');
  const blackEloRaw = extractPgnTag(pgnText, 'BlackElo');
  const whiteElo = Number.parseInt(String(whiteEloRaw || ''), 10);
  const blackElo = Number.parseInt(String(blackEloRaw || ''), 10);

  const white = whiteName
    ? {
        name: whiteName,
        userId: null,
        atTimeRating: Number.isFinite(whiteElo) ? whiteElo : null,
        currentRating: null,
      }
    : null;
  const black = blackName
    ? {
        name: blackName,
        userId: null,
        atTimeRating: Number.isFinite(blackElo) ? blackElo : null,
        currentRating: null,
      }
    : null;
  return { white, black };
}

function getPositionAtSelection(startFen, mainline, selection) {
  const game = new Chess(startFen);
  const playSanSafe = (rawSan) => {
    if (!rawSan) return null;
    const san = String(rawSan).trim();
    const candidates = [
      san,
      // Imported PGNs can carry annotation suffixes like "?!", "!!", etc.
      san.replace(/[!?]+$/g, ''),
    ];
    for (const cand of candidates) {
      if (!cand) continue;
      try {
        return game.move(cand) || null;
      } catch {
        // try next candidate
      }
    }
    return null;
  };
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
      const mv = playSanSafe(n.san);
      if (!mv) break;
      last = mv;
    }
    const anchor = parent[mi];
    const varLine = anchor?.variations?.[vi] || [];
    if (p < path.length - 1) {
      const nextSeg = path[p + 1];
      const [nextMiRaw] = String(nextSeg).split(':');
      const nextMi = Number(nextMiRaw);
      for (let i = 0; i <= nextMi && i < varLine.length; i += 1) {
        const mv = playSanSafe(varLine[i].san);
        if (!mv) break;
        last = mv;
      }
    }
  }
  const line = getLineByPath(mainline, path);
  const index = Number.isInteger(selection?.index) ? selection.index : -1;
  for (let i = 0; i <= index && i < line.length; i += 1) {
    const mv = playSanSafe(line[i].san);
    if (!mv) break;
    last = mv;
  }
  const lastMove = last?.from && last?.to ? [last.from, last.to] : undefined;
  return { fen: game.fen(), lastMove };
}

export default function AnalysisPage() {
  const router = useRouter();
  /** Survives React Strict Mode remount after takePgnForImportNonce removed the payload from localStorage. */
  const tacticImportPgnStashRef = useRef({ nonce: null, pgn: '', evalMainlinePawns: null });
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
  const [depthLimit, setDepthLimit] = useState(BASE_DEPTH_LIMIT);
  const [depthReached, setDepthReached] = useState(0);
  const [engineEvalCp, setEngineEvalCp] = useState(null);
  const [evalByKey, setEvalByKey] = useState(new Map());
  const [depthByKey, setDepthByKey] = useState(new Map());
  const [moveCommentDraft, setMoveCommentDraft] = useState('');
  const [engineMultipvLines, setEngineMultipvLines] = useState([]);
  const [showEngineBestMoves, setShowEngineBestMoves] = useState(true);
  const [hoveredEngineLineRank, setHoveredEngineLineRank] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [analysisPlayers, setAnalysisPlayers] = useState({ white: null, black: null });
  const engineCancelRef = useRef(null);
  const engineStateRef = useRef({ key: null, depth: 0, cpWhite: null });
  const { moveListNavRef, onWheelNavigate } = useMoveListWheelNavigation();

  const analysisPositionKey = useMemo(() => {
    const { fen } = getPositionAtSelection(startFen, mainline, selection);
    const idx = Number.isInteger(selection?.index) ? selection.index : -1;
    const path = Array.isArray(selection?.variationPath) ? selection.variationPath : [];
    const sk = idx < 0 ? 'main:initial' : `${path.join('|') || 'main'}:${idx}`;
    return `${fen}::${sk}`;
  }, [startFen, mainline, selection]);

  useEffect(() => {
    warmStockfish();
  }, []);

  useEffect(() => {
    setEngineMultipvLines([]);
    setHoveredEngineLineRank(null);
  }, [analysisPositionKey]);

  useEffect(() => {
    if (!showEngineBestMoves) setHoveredEngineLineRank(null);
  }, [showEngineBestMoves]);

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
    setEngineMultipvLines([]);
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
    setEngineMultipvLines([]);
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
    const { fen: analysisFen } = getPositionAtSelection(startFen, mainline, selection);
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

    if (!engineOn || !analysisFen) {
      return;
    }
    if (knownDepth >= depthLimit) {
      return;
    }

    if (engineCancelRef.current) engineCancelRef.current();
    const cancel = analyzeFenMultipvStream(analysisFen, depthLimit, {
      multipv: ENGINE_MULTIPV,
      onInfo: ({ depth, cpWhite, lines }) => {
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
        if (Array.isArray(lines) && lines.length) {
          setEngineMultipvLines(lines);
        }
      },
      onDone: ({ depth, cpWhite, lines }) => {
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
        if (Array.isArray(lines) && lines.length) {
          setEngineMultipvLines(lines);
        }
      },
    });
    engineCancelRef.current = cancel;
    return () => {
      if (engineCancelRef.current) engineCancelRef.current();
    };
  }, [engineOn, startFen, mainline, selection, depthLimit]);

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
      setEngineMultipvLines([]);
      setDepthReached(0);
      engineStateRef.current = { key: null, depth: 0, cpWhite: null };
      setInfoMessage('Imported FEN.');
      setAnalysisPlayers({ white: null, black: null });
    } catch {
      setInfoMessage('Invalid FEN.');
    }
  }, [fenInput, backrankToNumber]);

  const applyImportedPgnText = useCallback(
    (
      rawText,
      { infoMessage: msg = 'Imported PGN.', browseAtStart = false, evalMainlinePawns = null } = {}
    ) => {
      const raw = String(rawText || '').trim();
      if (!raw) {
        setInfoMessage('Empty PGN.');
        return false;
      }
      setPgnInput(raw);
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
      setSelection(
        browseAtStart
          ? { index: -1, variationPath: [] }
          : { index: Math.max(-1, tree.length - 1), variationPath: [] }
      );
      const seedEvalByKey = new Map();
      const seedDepthByKey = new Map();
      if (Array.isArray(evalMainlinePawns)) {
        const first = evalMainlinePawns[0];
        if (Number.isFinite(first)) {
          seedEvalByKey.set('main:initial', Number(first));
          seedDepthByKey.set('main:initial', 1);
        }
        for (let i = 1; i < evalMainlinePawns.length && i <= tree.length; i += 1) {
          const v = evalMainlinePawns[i];
          if (!Number.isFinite(v)) continue;
          const k = `main:${i - 1}`;
          seedEvalByKey.set(k, Number(v));
          seedDepthByKey.set(k, 1);
        }
      }
      setEvalByKey(seedEvalByKey);
      setDepthByKey(seedDepthByKey);
      setDepthReached(0);
      setEngineEvalCp(null);
      setEngineMultipvLines([]);
      engineStateRef.current = { key: null, depth: 0, cpWhite: null };
      setInfoMessage(msg);
      setAnalysisPlayers(parsePgnPlayerPanels(raw));
      return true;
    },
    [backrankToNumber]
  );

  const importPgn = useCallback(() => {
    applyImportedPgnText(pgnInput.trim());
  }, [pgnInput, applyImportedPgnText]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.importPgn !== '1') return;
    const nRaw = router.query.n;
    const n = Array.isArray(nRaw) ? nRaw[0] : nRaw;
    if (!n) return;

    let raw = '';
    let importedEvalMainlinePawns = null;
    if (tacticImportPgnStashRef.current.nonce === n && tacticImportPgnStashRef.current.pgn) {
      raw = tacticImportPgnStashRef.current.pgn;
      importedEvalMainlinePawns = tacticImportPgnStashRef.current.evalMainlinePawns || null;
    } else {
      const payload = takeAnalysisImportForNonce(n);
      raw = payload?.pgn || '';
      importedEvalMainlinePawns = payload?.evalMainlinePawns || null;
      if (raw) {
        tacticImportPgnStashRef.current = {
          nonce: n,
          pgn: raw,
          evalMainlinePawns: importedEvalMainlinePawns,
        };
      }
    }

    const atRaw = router.query.at;
    const at = Array.isArray(atRaw) ? atRaw[0] : atRaw;
    const browseAtStart = at === 'start';

    if (raw) {
      applyImportedPgnText(raw, {
        infoMessage: 'Loaded PGN in analysis.',
        browseAtStart,
        evalMainlinePawns: importedEvalMainlinePawns,
      });
    } else {
      setInfoMessage('No imported PGN found. Open from tactics or profile history again.');
    }
    router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
  }, [router.isReady, router.query.importPgn, router.query.n, router.query.at, applyImportedPgnText, router]);

  useEffect(() => {
    if (!router.isReady) return;
    const rawId = router.query.openingShare;
    const openingShareId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!openingShareId) return;
    if (!/^[0-9a-f-]{36}$/i.test(openingShareId)) {
      setInfoMessage('Invalid opening share link.');
      router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/opening-share/${encodeURIComponent(openingShareId)}`);
        const payload = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !payload?.analysisPgn) {
          setInfoMessage(payload?.error || 'Failed to load shared opening.');
          router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
          return;
        }
        applyImportedPgnText(payload.analysisPgn, {
          infoMessage: 'Loaded shared opening in analysis.',
          browseAtStart: false,
        });
        const whitePanel = payload.color === 'white'
          ? {
              name: payload.playerName || 'Player',
              userId: payload.userId || null,
              atTimeRating: Number.isFinite(payload.ratingAtTime) ? payload.ratingAtTime : null,
              currentRating: Number.isFinite(payload.currentRating) ? payload.currentRating : null,
            }
          : null;
        const blackPanel = payload.color === 'black'
          ? {
              name: payload.playerName || 'Player',
              userId: payload.userId || null,
              atTimeRating: Number.isFinite(payload.ratingAtTime) ? payload.ratingAtTime : null,
              currentRating: Number.isFinite(payload.currentRating) ? payload.currentRating : null,
            }
          : null;
        setAnalysisPlayers({ white: whitePanel, black: blackPanel });
      } catch {
        if (!cancelled) setInfoMessage('Failed to load shared opening.');
      } finally {
        if (!cancelled) {
          router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.openingShare, applyImportedPgnText, router]);

  const topPanel = boardOrientation === 'white' ? analysisPlayers.black : analysisPlayers.white;
  const bottomPanel = boardOrientation === 'white' ? analysisPlayers.white : analysisPlayers.black;

  const whiteToMove = whiteToMoveFromFen(currentFen);

  const engineBestLinesForMoveList = useMemo(() => {
    if (!showEngineBestMoves || !engineMultipvLines.length) return null;
    const fen = currentFen;
    const slice = engineMultipvLines.slice(0, ENGINE_MULTIPV);
    return slice.map((ln, lineIdx) => {
      const loss = lossCpVsBestLine(slice, lineIdx, whiteToMove);
      const brush = lossToEngineBrush(loss);
      const sanPv = uciPvToSanString(fen, ln.pvUci);
      return {
        rank: ln.multipv,
        evalText: formatEvalFromCpWhite(ln.cpWhite),
        pvText: sanPv || (Array.isArray(ln.pvUci) ? ln.pvUci.join(' ') : ''),
        color: brush.lineColor,
      };
    });
  }, [showEngineBestMoves, engineMultipvLines, currentFen, whiteToMove]);

  const playEngineLineFirstMove = useCallback((rank) => {
    const line = engineMultipvLines.find((ln) => ln.multipv === rank);
    const firstUci = Array.isArray(line?.pvUci) ? line.pvUci[0] : null;
    if (!firstUci || firstUci.length < 4 || !currentFen) return;
    const from = firstUci.slice(0, 2);
    const to = firstUci.slice(2, 4);
    const promoChar = firstUci[4]?.toLowerCase();
    const promotion = promoChar ? { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' }[promoChar] : undefined;
    const g = new Chess(currentFen, { chess960: true });
    const move = g.move({ from, to, promotion });
    if (!move?.san) return;
    onBoardMove({ from, to, san: move.san });
  }, [engineMultipvLines, currentFen, onBoardMove]);

  const { analysisAutoShapes, analysisDrawableBrushes } = useMemo(() => {
    if (!showEngineBestMoves || !engineMultipvLines.length) {
      return EMPTY_ANALYSIS_DRAWABLE;
    }
    const sq = (k) => typeof k === 'string' && /^[a-h][1-8]$/.test(k);
    const slice = engineMultipvLines.slice(0, ENGINE_MULTIPV);
    const linesToShow =
      hoveredEngineLineRank != null
        ? slice.filter((ln) => ln.multipv === hoveredEngineLineRank)
        : slice;

    const brushes = {};
    const shapes = [];
    for (const ln of linesToShow) {
      if (!sq(ln.firstFrom) || !sq(ln.firstTo)) continue;
      const lineIdx = slice.findIndex((x) => x.multipv === ln.multipv);
      const loss = lossCpVsBestLine(slice, lineIdx, whiteToMove);
      const b = lossToEngineBrush(loss);
      const brushKey = engineBrushKey(ln.multipv, b.lineColor);
      if (!brushes[brushKey]) {
        brushes[brushKey] = {
          key: brushKey,
          color: b.color,
          opacity: b.opacity,
          lineWidth: b.lineWidth,
        };
      }
      shapes.push({ orig: ln.firstFrom, dest: ln.firstTo, brush: brushKey });
    }
    return { analysisAutoShapes: shapes, analysisDrawableBrushes: brushes };
  }, [showEngineBestMoves, engineMultipvLines, hoveredEngineLineRank, whiteToMove]);

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
              {topPanel ? (
                <div className="analysis-player-panel analysis-player-panel--top">
                  <RatingDisplay
                    className="rating-display--panel"
                    label={`${topPanel.name} (openings)`}
                    rating={topPanel.atTimeRating}
                    secondaryRating={topPanel.currentRating}
                    profileUserId={topPanel.userId}
                  />
                </div>
              ) : null}
              <Chessboard
                fen={currentFen}
                orientation={boardOrientation}
                onMove={onBoardMove}
                lastMove={lastMove}
                onWheelNavigate={onWheelNavigate}
                autoShapes={analysisAutoShapes}
                extraDrawableBrushes={analysisDrawableBrushes}
              />
              {bottomPanel ? (
                <div className="analysis-player-panel analysis-player-panel--bottom">
                  <RatingDisplay
                    className="rating-display--panel"
                    label={`${bottomPanel.name} (openings)`}
                    rating={bottomPanel.atTimeRating}
                    secondaryRating={bottomPanel.currentRating}
                    profileUserId={bottomPanel.userId}
                  />
                </div>
              ) : null}
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
              <label className="analysis-engine-toggle">
                <input
                  type="checkbox"
                  checked={engineOn}
                  onChange={(e) => setEngineOn(e.target.checked)}
                />
                <span className="slider-toggle__track" aria-hidden>
                  <span className="slider-toggle__thumb" />
                </span>
                <span>Engine</span>
              </label>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                disabled={!engineMultipvLines.length}
                onClick={() => setShowEngineBestMoves((v) => !v)}
              >
                {showEngineBestMoves ? 'Hide best moves' : 'Show best moves'}
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
                {Number.isFinite(engineEvalCp) ? `Eval ${formatEvalFromCpWhite(engineEvalCp)}` : ''}
              </span>
            </div>
            <MoveList
              ref={moveListNavRef}
              className="move-list--openings"
              pgn={treePgn}
              evalData={moveListEvalData}
              allowSparseEvalData
              userColor="white"
              loading={false}
              selectedPosition={selection}
              resetSelectionOnPgnChange={false}
              onBrowsePositionChanged={handleBrowsePositionChanged}
              engineBestLines={engineBestLinesForMoveList}
              onEngineLineHover={showEngineBestMoves ? setHoveredEngineLineRank : null}
              onEngineLineClick={showEngineBestMoves ? playEngineLineFirstMove : null}
              navRight={
                <button
                  type="button"
                  className="ml-btn"
                  onClick={() => setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))}
                  aria-label="Flip board"
                  title="Flip board"
                >
                  ↻
                </button>
              }
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
