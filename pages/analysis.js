import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import PositionDisplay from '../components/PositionDisplay';
import SectionTitle from '../components/SectionTitle';
import BackrankInput from '../components/BackrankInput';
import AnalysisCommentBox from '../components/AnalysisCommentBox';
import AnalysisEvalGraph from '../components/AnalysisEvalGraph';
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
import { useSupabaseSession } from '../lib/SessionContext';

const EXAMPLE_BACKRANK = 'bbnnrkqr';
const MAX_DEPTH_CAP = 50;
const BASE_DEPTH_LIMIT = 20;
const DEPTH_UNLOCK_STEP = 5;
const ENGINE_MULTIPV = 5;
const EMPTY_ANALYSIS_DRAWABLE = { analysisAutoShapes: [], analysisDrawableBrushes: {} };
const ANALYSIS_CACHE_KEY = 'dojo.analysis.cache.v1';
const USER_PRIMARY_BRUSH_KEY = 'user-primary';
const USER_SECONDARY_BRUSH_KEY = 'user-secondary';
const ANALYSIS_USER_BRUSHES = {
  green: { key: 'green', color: '#2e8bff', opacity: 0.95, lineWidth: 10 },
  red: { key: 'red', color: '#cb5cff', opacity: 0.95, lineWidth: 10 },
  blue: { key: 'blue', color: '#2e8bff', opacity: 0.95, lineWidth: 10 },
  yellow: { key: 'yellow', color: '#cb5cff', opacity: 0.95, lineWidth: 10 },
  [USER_PRIMARY_BRUSH_KEY]: { key: USER_PRIMARY_BRUSH_KEY, color: '#2e8bff', opacity: 0.95, lineWidth: 10 },
  [USER_SECONDARY_BRUSH_KEY]: { key: USER_SECONDARY_BRUSH_KEY, color: '#cb5cff', opacity: 0.95, lineWidth: 10 },
};

const PRESELECT_BRUSH_KEY = 'variation-preselect';
const PRESELECT_BRUSH = { key: PRESELECT_BRUSH_KEY, color: '#d4af37', opacity: 1, lineWidth: 8 };

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
  line.rootVariations = [];
  line.rootComment = '';
  return line;
}

function cloneLine(line) {
  const out = createLine();
  out.rootComment = String(line?.rootComment || '');
  out.rootVariations = (line?.rootVariations || []).map(cloneLine);
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

function buildValidSelectionKeySet(mainline) {
  const keys = new Set(['main:initial']);
  const walk = (line, path) => {
    for (let i = 0; i < line.length; i += 1) {
      const key = `${path.join('|') || 'main'}:${i}`;
      keys.add(key);
      const node = line[i];
      for (let v = 0; v < (node?.variations || []).length; v += 1) {
        walk(node.variations[v], [...path, `${i}:${v}`]);
      }
    }
  };
  for (let v = 0; v < (mainline?.rootVariations || []).length; v += 1) {
    walk(mainline.rootVariations[v], [`root:${v}`]);
  }
  walk(mainline, []);
  return keys;
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
      if (whiteToMove) {
        out.push(`${moveNo}. ${node.san}${comment}`);
      } else if (i === 0) {
        // Variation lines that begin with a black move should include "<n>..." for parser compatibility.
        out.push(`${moveNo}... ${node.san}${comment}`);
      } else {
        out.push(`${node.san}${comment}`);
      }
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
  const rootVariationText = (mainline?.rootVariations || [])
    .map((line, idx) => renderLine(line, 0, [`root:${idx}`]))
    .filter(Boolean)
    .map((text) => `(${text})`)
    .join(' ');
  const mainlineText = renderLine(mainline, 0, []);
  const movetext = `${prefix}${[rootVariationText, mainlineText].filter(Boolean).join(' ')}`.trim();
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
    if (includeInitial) {
      for (let v = 0; v < (line?.rootVariations || []).length; v += 1) {
        arr.push(buildFromLine(line.rootVariations[v], [`root:${v}`], false));
      }
    }
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
  const whiteUserId = extractPgnTag(pgnText, 'WhiteId');
  const blackUserId = extractPgnTag(pgnText, 'BlackId');
  const whiteEloRaw = extractPgnTag(pgnText, 'WhiteElo');
  const blackEloRaw = extractPgnTag(pgnText, 'BlackElo');
  const whiteElo = Number.parseInt(String(whiteEloRaw || ''), 10);
  const blackElo = Number.parseInt(String(blackEloRaw || ''), 10);

  const white = whiteName
    ? {
        name: whiteName,
        userId: whiteUserId || null,
        atTimeRating: Number.isFinite(whiteElo) ? whiteElo : null,
        currentRating: null,
      }
    : null;
  const black = blackName
    ? {
        name: blackName,
        userId: blackUserId || null,
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
  let line = mainline;
  for (let p = 0; p < path.length; p += 1) {
    const seg = path[p];
    const [miRaw, viRaw] = String(seg).split(':');
    if (miRaw === 'root') {
      line = mainline?.rootVariations?.[Number(viRaw)] || [];
      continue;
    }
    const mi = Number(miRaw);
    const vi = Number(viRaw);
    for (let i = 0; i <= mi; i += 1) {
      const n = line[i];
      if (!n) break;
      const mv = playSanSafe(n.san);
      if (!mv) break;
      last = mv;
    }
    const anchor = line[mi];
    line = anchor?.variations?.[vi] || [];
  }
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
  const session = useSupabaseSession();
  /** Survives React Strict Mode remount after takePgnForImportNonce removed the payload from localStorage. */
  const tacticImportPgnStashRef = useRef({
    nonce: null,
    pgn: '',
    evalMainlinePawns: null,
    orientation: null,
    analysisPlayers: null,
  });
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
  const [engineLinesByKey, setEngineLinesByKey] = useState(new Map());
  const [showEngineBestMoves, setShowEngineBestMoves] = useState(true);
  const [hoveredEngineLineRank, setHoveredEngineLineRank] = useState(null);
  const [userShapesByPositionKey, setUserShapesByPositionKey] = useState(new Map());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [analysisPlayers, setAnalysisPlayers] = useState({ white: null, black: null });
  const [preselectSan, setPreselectSan] = useState(null);
  const [collapseVariations, setCollapseVariations] = useState(true);
  const [studyId, setStudyId] = useState(null);
  const [studyTitle, setStudyTitle] = useState('');
  const [studyIsPublic, setStudyIsPublic] = useState(false);
  const [studyIsOwner, setStudyIsOwner] = useState(false);
  const [studyLoading, setStudyLoading] = useState(false);
  const [studySaving, setStudySaving] = useState(false);
  const lastStudySavedJsonRef = useRef('');
  const engineCancelRef = useRef(null);
  const engineStateRef = useRef({ key: null, depth: 0, cpWhite: null });
  const restoredFromCacheRef = useRef(false);
  const { moveListNavRef, onWheelNavigate } = useMoveListWheelNavigation();

  const authHeader = useMemo(() => {
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [session]);

  const buildStudySnapshot = useCallback(() => {
    return {
      version: 1,
      positionNr,
      backrankInput,
      startFen,
      pgnInput,
      mainline,
      selection,
      currentFen,
      lastMove,
      boardOrientation,
      evalEntries: Array.from(evalByKey.entries()),
      depthEntries: Array.from(depthByKey.entries()),
      depthLimit,
      depthReached,
      engineEvalCp,
      engineMultipvLines,
      engineLinesByKeyEntries: Array.from(engineLinesByKey.entries()),
      engineOn,
      showEngineBestMoves,
      userShapesByPositionKeyEntries: Array.from(userShapesByPositionKey.entries()),
      analysisPlayers,
      collapseVariations,
    };
  }, [
    positionNr,
    backrankInput,
    startFen,
    pgnInput,
    mainline,
    selection,
    currentFen,
    lastMove,
    boardOrientation,
    evalByKey,
    depthByKey,
    depthLimit,
    depthReached,
    engineEvalCp,
    engineMultipvLines,
    engineLinesByKey,
    engineOn,
    showEngineBestMoves,
    userShapesByPositionKey,
    analysisPlayers,
    collapseVariations,
  ]);

  const resetAnalysisLine = useCallback(() => {
    setMainline(createLine());
    setSelection({ index: -1, variationPath: [] });
    setEvalByKey(new Map());
    setDepthByKey(new Map());
    setDepthReached(0);
    setEngineEvalCp(null);
    setEngineMultipvLines([]);
    setEngineLinesByKey(new Map());
    engineStateRef.current = { key: null, depth: 0, cpWhite: null };
    setUserShapesByPositionKey(new Map());
    setMoveCommentDraft('');
    setInfoMessage('Reset.');
  }, []);

  const resetToFreshAnalysisBoard = useCallback(() => {
    // Reset the entire analysis workspace (like opening a fresh analysis board).
    // Keep this independent of studies: leaving a study should not delete it.
    const nextFen = positionNrToStartFen(0);
    setPositionNr(0);
    setBackrankInput(numberToBackrank.get(0) || EXAMPLE_BACKRANK);
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
    setEngineLinesByKey(new Map());
    engineStateRef.current = { key: null, depth: 0, cpWhite: null };
    setInfoMessage('');
    setUserShapesByPositionKey(new Map());
    setMoveCommentDraft('');
    setBoardOrientation('white');
    setAnalysisPlayers({ white: null, black: null });
    setCollapseVariations(true);
  }, [numberToBackrank]);

  const hasUnsavedScratchWork = useMemo(() => {
    if (studyId) return false;
    if ((pgnInput || '').trim()) return true;
    if (Array.isArray(mainline) && mainline.length) return true;
    if (evalByKey.size) return true;
    if (depthByKey.size) return true;
    if (engineLinesByKey.size) return true;
    if (userShapesByPositionKey.size) return true;
    return false;
  }, [studyId, pgnInput, mainline, evalByKey, depthByKey, engineLinesByKey, userShapesByPositionKey]);

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
    if (!router.isReady || restoredFromCacheRef.current) return;
    const isImporting = router.query.importPgn === '1' || Boolean(router.query.openingShare) || Boolean(router.query.study);
    if (isImporting) {
      restoredFromCacheRef.current = true;
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(ANALYSIS_CACHE_KEY);
      if (!raw) {
        restoredFromCacheRef.current = true;
        return;
      }
      const cached = JSON.parse(raw);
      if (!cached || typeof cached !== 'object') {
        restoredFromCacheRef.current = true;
        return;
      }

      if (Number.isInteger(cached.positionNr)) setPositionNr(Math.max(0, Math.min(959, cached.positionNr)));
      if (typeof cached.backrankInput === 'string') setBackrankInput(cached.backrankInput);
      if (typeof cached.startFen === 'string' && cached.startFen.trim()) setStartFen(cached.startFen);
      if (typeof cached.pgnInput === 'string') setPgnInput(cached.pgnInput);
      if (Array.isArray(cached.mainline)) setMainline(cached.mainline);
      if (
        cached.selection &&
        Number.isInteger(cached.selection.index) &&
        Array.isArray(cached.selection.variationPath)
      ) {
        setSelection({
          index: cached.selection.index,
          variationPath: cached.selection.variationPath.map((x) => String(x)),
        });
      }
      if (typeof cached.currentFen === 'string' && cached.currentFen.trim()) setCurrentFen(cached.currentFen);
      if (Array.isArray(cached.lastMove) && cached.lastMove.length === 2) setLastMove(cached.lastMove);
      if (cached.boardOrientation === 'white' || cached.boardOrientation === 'black') {
        setBoardOrientation(cached.boardOrientation);
      }
      if (Array.isArray(cached.evalEntries)) {
        setEvalByKey(new Map(cached.evalEntries.filter((e) => Array.isArray(e) && e.length === 2)));
      }
      if (Array.isArray(cached.depthEntries)) {
        setDepthByKey(new Map(cached.depthEntries.filter((e) => Array.isArray(e) && e.length === 2)));
      }
      if (Number.isFinite(cached.depthLimit)) {
        setDepthLimit(Math.max(BASE_DEPTH_LIMIT, Math.min(MAX_DEPTH_CAP, Math.round(cached.depthLimit))));
      }
      if (Number.isFinite(cached.depthReached)) setDepthReached(Math.max(0, Math.round(cached.depthReached)));
      if (Number.isFinite(cached.engineEvalCp)) setEngineEvalCp(cached.engineEvalCp);
      if (Array.isArray(cached.engineMultipvLines)) setEngineMultipvLines(cached.engineMultipvLines);
      if (Array.isArray(cached.engineLinesByKeyEntries)) {
        setEngineLinesByKey(new Map(cached.engineLinesByKeyEntries.filter((e) => Array.isArray(e) && e.length === 2)));
      }
      if (typeof cached.engineOn === 'boolean') setEngineOn(cached.engineOn);
      if (typeof cached.showEngineBestMoves === 'boolean') setShowEngineBestMoves(cached.showEngineBestMoves);
      if (Array.isArray(cached.userShapesByPositionKeyEntries)) {
        setUserShapesByPositionKey(new Map(cached.userShapesByPositionKeyEntries.filter((e) => Array.isArray(e) && e.length === 2)));
      }
    } catch {
      // Ignore malformed cache payloads.
    } finally {
      restoredFromCacheRef.current = true;
    }
  }, [router.isReady, router.query.importPgn, router.query.openingShare]);

  useEffect(() => {
    if (!router.isReady) return;
    const rawStudy = router.query.study;
    const nextStudyId = Array.isArray(rawStudy) ? rawStudy[0] : rawStudy;
    if (!nextStudyId) return;
    if (!/^[0-9a-f-]{36}$/i.test(nextStudyId)) {
      setInfoMessage('Invalid study id.');
      router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
      return;
    }

    let cancelled = false;
    setStudyLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/studies/${encodeURIComponent(nextStudyId)}`, { headers: { ...authHeader } });
        const payload = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setInfoMessage(payload?.error || 'Failed to load study.');
          setStudyLoading(false);
          return;
        }

        const snapshot = payload?.analysis && typeof payload.analysis === 'object' ? payload.analysis : null;
        if (!snapshot) {
          setInfoMessage('Study is missing analysis payload.');
          setStudyLoading(false);
          return;
        }

        setStudyId(payload.id || nextStudyId);
        setStudyTitle(String(payload.title || ''));
        setStudyIsPublic(Boolean(payload.isPublic));
        setStudyIsOwner(Boolean(payload.isOwner));

        // Hydrate state (tolerant of older snapshots).
        const loadedStartFen = typeof snapshot.startFen === 'string' && snapshot.startFen.trim() ? snapshot.startFen : '';
        if (typeof snapshot.backrankInput === 'string') setBackrankInput(snapshot.backrankInput);
        if (loadedStartFen) setStartFen(loadedStartFen);
        const backrankFromFen = loadedStartFen ? extract960StartingBackrankFromFen(loadedStartFen) : null;
        const mappedNrFromFen = backrankFromFen ? backrankToNumber.get(backrankFromFen) : null;
        const hasMappedNr = Number.isInteger(mappedNrFromFen);
        if (typeof snapshot.backrankInput === 'string' && snapshot.backrankInput.trim()) {
          setBackrankInput(snapshot.backrankInput);
        } else if (backrankFromFen) {
          setBackrankInput(backrankFromFen);
        }
        if (hasMappedNr) {
          // Prefer deriving from startFen, since stored positionNr may be stale or missing.
          setPositionNr(mappedNrFromFen);
        } else if (Number.isInteger(snapshot.positionNr)) {
          setPositionNr(Math.max(0, Math.min(959, snapshot.positionNr)));
        }
        if (typeof snapshot.pgnInput === 'string') setPgnInput(snapshot.pgnInput);
        if (Array.isArray(snapshot.mainline)) setMainline(snapshot.mainline);
        if (
          snapshot.selection &&
          Number.isInteger(snapshot.selection.index) &&
          Array.isArray(snapshot.selection.variationPath)
        ) {
          setSelection({
            index: snapshot.selection.index,
            variationPath: snapshot.selection.variationPath.map((x) => String(x)),
          });
        } else {
          setSelection({ index: -1, variationPath: [] });
        }
        if (typeof snapshot.currentFen === 'string' && snapshot.currentFen.trim()) setCurrentFen(snapshot.currentFen);
        if (Array.isArray(snapshot.lastMove) && snapshot.lastMove.length === 2) setLastMove(snapshot.lastMove);
        if (snapshot.boardOrientation === 'white' || snapshot.boardOrientation === 'black') {
          setBoardOrientation(snapshot.boardOrientation);
        }
        if (Array.isArray(snapshot.evalEntries)) {
          setEvalByKey(new Map(snapshot.evalEntries.filter((e) => Array.isArray(e) && e.length === 2)));
        } else {
          setEvalByKey(new Map());
        }
        if (Array.isArray(snapshot.depthEntries)) {
          setDepthByKey(new Map(snapshot.depthEntries.filter((e) => Array.isArray(e) && e.length === 2)));
        } else {
          setDepthByKey(new Map());
        }
        if (Number.isFinite(snapshot.depthLimit)) {
          setDepthLimit(Math.max(BASE_DEPTH_LIMIT, Math.min(MAX_DEPTH_CAP, Math.round(snapshot.depthLimit))));
        }
        if (Number.isFinite(snapshot.depthReached)) setDepthReached(Math.max(0, Math.round(snapshot.depthReached)));
        if (Number.isFinite(snapshot.engineEvalCp)) setEngineEvalCp(snapshot.engineEvalCp);
        if (Array.isArray(snapshot.engineMultipvLines)) setEngineMultipvLines(snapshot.engineMultipvLines);
        if (Array.isArray(snapshot.engineLinesByKeyEntries)) {
          setEngineLinesByKey(new Map(snapshot.engineLinesByKeyEntries.filter((e) => Array.isArray(e) && e.length === 2)));
        } else {
          setEngineLinesByKey(new Map());
        }
        if (typeof snapshot.engineOn === 'boolean') setEngineOn(snapshot.engineOn);
        if (typeof snapshot.showEngineBestMoves === 'boolean') setShowEngineBestMoves(snapshot.showEngineBestMoves);
        if (Array.isArray(snapshot.userShapesByPositionKeyEntries)) {
          setUserShapesByPositionKey(new Map(snapshot.userShapesByPositionKeyEntries.filter((e) => Array.isArray(e) && e.length === 2)));
        } else {
          setUserShapesByPositionKey(new Map());
        }
        if (snapshot.analysisPlayers && typeof snapshot.analysisPlayers === 'object') {
          setAnalysisPlayers(snapshot.analysisPlayers);
        }
        if (typeof snapshot.collapseVariations === 'boolean') setCollapseVariations(snapshot.collapseVariations);

        try {
          lastStudySavedJsonRef.current = JSON.stringify({
            title: String(payload.title || '').trim(),
            isPublic: Boolean(payload.isPublic),
            analysis: snapshot,
          });
        } catch {
          lastStudySavedJsonRef.current = '';
        }

        // Loaded successfully; no banner needed.
      } catch (e) {
        if (!cancelled) setInfoMessage('Failed to load study.');
      } finally {
        if (!cancelled) setStudyLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.study, authHeader, router]);

  useEffect(() => {
    // If we leave a study route, reset study UI state to defaults (private).
    if (!router.isReady) return;
    const rawStudy = router.query.study;
    const activeStudyId = Array.isArray(rawStudy) ? rawStudy[0] : rawStudy;
    if (activeStudyId) return;
    setStudyId(null);
    setStudyTitle('');
    setStudyIsPublic(false);
    setStudyIsOwner(false);
    setStudyLoading(false);
    setStudySaving(false);
    lastStudySavedJsonRef.current = '';
  }, [router.isReady, router.query.study]);

  useEffect(() => {
    setEngineMultipvLines(engineLinesByKey.get(analysisPositionKey) || []);
    setHoveredEngineLineRank(null);
  }, [analysisPositionKey, engineLinesByKey]);

  useEffect(() => {
    if (!showEngineBestMoves) setHoveredEngineLineRank(null);
  }, [showEngineBestMoves]);

  useEffect(() => {
    if (!restoredFromCacheRef.current || typeof window === 'undefined') return;
    const payload = {
      positionNr,
      backrankInput,
      startFen,
      pgnInput,
      mainline,
      selection,
      currentFen,
      lastMove,
      boardOrientation,
      evalEntries: Array.from(evalByKey.entries()),
      depthEntries: Array.from(depthByKey.entries()),
      depthLimit,
      depthReached,
      engineEvalCp,
      engineMultipvLines,
      engineLinesByKeyEntries: Array.from(engineLinesByKey.entries()),
      engineOn,
      showEngineBestMoves,
      userShapesByPositionKeyEntries: Array.from(userShapesByPositionKey.entries()),
    };
    try {
      window.sessionStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore session storage write failures.
    }
  }, [
    positionNr,
    backrankInput,
    startFen,
    pgnInput,
    mainline,
    selection,
    currentFen,
    lastMove,
    boardOrientation,
    evalByKey,
    depthByKey,
    depthLimit,
    depthReached,
    engineEvalCp,
    engineMultipvLines,
    engineLinesByKey,
    engineOn,
    showEngineBestMoves,
    userShapesByPositionKey,
  ]);

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
    setEngineLinesByKey(new Map());
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
    setEngineLinesByKey(new Map());
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
      } else if (index >= 0 && line[index + 1]?.san === moveSan) {
        setSelection({ index: index + 1, variationPath: path });
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
        if (path.length > 0) {
          // At the start of a variation line: a new move should create/select a sibling variation
          // at the parent anchor position (not a nested variation under this line's first move).
          const parentPath = path.slice(0, -1);
          const [anchorRaw] = String(path[path.length - 1]).split(':');
          if (anchorRaw === 'root') {
            const existingRootIdx = (next.rootVariations || []).findIndex((vline) => vline?.[0]?.san === moveSan);
            if (existingRootIdx >= 0) {
              setSelection({ index: 0, variationPath: [`root:${existingRootIdx}`] });
            } else {
              next.rootVariations.push([{ san: moveSan, comment: '', variations: [] }]);
              setSelection({ index: 0, variationPath: [`root:${next.rootVariations.length - 1}`] });
            }
            return next;
          }
          const anchorIndex = Number(anchorRaw);
          const parentLine = getLineByPath(next, parentPath);
          const anchor = parentLine[anchorIndex];
          if (!anchor) return prev;
          const existingVarIdx = (anchor.variations || []).findIndex((vline) => vline?.[0]?.san === moveSan);
          if (existingVarIdx >= 0) {
            setSelection({ index: 0, variationPath: [...parentPath, `${anchorIndex}:${existingVarIdx}`] });
          } else {
            anchor.variations.push([{ san: moveSan, comment: '', variations: [] }]);
            setSelection({ index: 0, variationPath: [...parentPath, `${anchorIndex}:${anchor.variations.length - 1}`] });
          }
        } else if (!line.length) {
          line.push({ san: moveSan, comment: '', variations: [] });
          setSelection({ index: 0, variationPath: path });
        } else if (line[0]?.san === moveSan) {
          setSelection({ index: 0, variationPath: path });
        } else {
          const existingRootIdx = (next.rootVariations || []).findIndex((vline) => vline?.[0]?.san === moveSan);
          if (existingRootIdx >= 0) {
            setSelection({ index: 0, variationPath: [`root:${existingRootIdx}`] });
          } else {
            next.rootVariations.push([{ san: moveSan, comment: '', variations: [] }]);
            setSelection({ index: 0, variationPath: [`root:${next.rootVariations.length - 1}`] });
          }
        }
      }

      return next;
    });
  }, [currentFen, selection]);

  const handleUserShapesChanged = useCallback((shapes) => {
    const safeShapes = Array.isArray(shapes) ? shapes : [];
    setUserShapesByPositionKey((prev) => {
      const next = new Map(prev);
      if (safeShapes.length) next.set(analysisPositionKey, safeShapes);
      else next.delete(analysisPositionKey);
      return next;
    });
  }, [analysisPositionKey]);

  const getMoveSiblingMeta = useCallback((tree, variationPath, index) => {
    if (!Array.isArray(variationPath) || !Number.isInteger(index) || index < 0) return null;
    const line = getLineByPath(tree, variationPath);
    if (!line[index]) return null;

    if (index > 0) {
      const anchorIndex = index - 1;
      const anchorNode = line[anchorIndex];
      if (!anchorNode) return null;
      const siblings = [line.slice(index), ...(anchorNode.variations || [])];
      return {
        mode: 'within-line',
        linePath: variationPath,
        index,
        siblings,
        selectedPos: 0,
      };
    }

    if (!variationPath.length) {
      if (!(tree?.rootVariations || []).length) return null;
      const siblings = [tree.slice(0), ...(tree.rootVariations || [])];
      return {
        mode: 'at-root',
        siblings,
        selectedPos: 0,
      };
    }

    const [headRaw, headVarRaw] = String(variationPath[0]).split(':');
    if (headRaw === 'root' && variationPath.length === 1) {
      const rootVarIndex = Number(headVarRaw);
      if (!Number.isInteger(rootVarIndex) || rootVarIndex < 0 || rootVarIndex >= (tree?.rootVariations || []).length) {
        return null;
      }
      const siblings = [tree.slice(0), ...(tree.rootVariations || [])];
      return {
        mode: 'at-root',
        siblings,
        selectedPos: rootVarIndex + 1,
      };
    }

    if (!variationPath.length) return null;
    const parentPath = variationPath.slice(0, -1);
    const [anchorRaw, varRaw] = String(variationPath[variationPath.length - 1]).split(':');
    const anchorIndex = Number(anchorRaw);
    const varIndex = Number(varRaw);
    const parentLine = getLineByPath(tree, parentPath);
    const anchorNode = parentLine[anchorIndex];
    if (!anchorNode || !Number.isInteger(varIndex) || varIndex < 0 || varIndex >= (anchorNode.variations || []).length) {
      return null;
    }
    const siblings = [parentLine.slice(anchorIndex + 1), ...(anchorNode.variations || [])];
    return {
      mode: 'at-parent-anchor',
      parentPath,
      anchorIndex,
      siblings,
      selectedPos: varIndex + 1,
    };
  }, []);

  const canPromoteMove = useCallback((variationPath, index) => {
    const meta = getMoveSiblingMeta(mainline, variationPath, index);
    return Boolean(meta && meta.selectedPos > 0);
  }, [getMoveSiblingMeta, mainline]);

  const canDemoteMove = useCallback((variationPath, index) => {
    const meta = getMoveSiblingMeta(mainline, variationPath, index);
    return Boolean(meta && meta.selectedPos < meta.siblings.length - 1);
  }, [getMoveSiblingMeta, mainline]);

  const reorderMoveLine = useCallback((variationPath, index, direction) => {
    if (!Number.isInteger(direction) || direction === 0) return;
    setMainline((prev) => {
      const next = cloneLine(prev);
      const meta = getMoveSiblingMeta(next, variationPath, index);
      if (!meta) return prev;
      const targetPos = meta.selectedPos + direction;
      if (targetPos < 0 || targetPos >= meta.siblings.length) return prev;
      const reordered = [...meta.siblings];
      const tmp = reordered[targetPos];
      reordered[targetPos] = reordered[meta.selectedPos];
      reordered[meta.selectedPos] = tmp;

      if (meta.mode === 'within-line') {
        const line = getLineByPath(next, meta.linePath);
        const anchorNode = line[meta.index - 1];
        line.splice(meta.index, line.length - meta.index, ...reordered[0]);
        anchorNode.variations = reordered.slice(1);
        if (targetPos === 0) {
          setSelection({ index: meta.index, variationPath: meta.linePath });
        } else {
          setSelection({
            index: 0,
            variationPath: [...meta.linePath, `${meta.index - 1}:${targetPos - 1}`],
          });
        }
      } else {
        if (meta.mode === 'at-root') {
          next.splice(0, next.length, ...reordered[0]);
          next.rootVariations = reordered.slice(1);
          if (targetPos === 0) {
            setSelection({ index: 0, variationPath: [] });
          } else {
            setSelection({ index: 0, variationPath: [`root:${targetPos - 1}`] });
          }
          return next;
        }
        const parentLine = getLineByPath(next, meta.parentPath);
        const anchorNode = parentLine[meta.anchorIndex];
        parentLine.splice(meta.anchorIndex + 1, parentLine.length - (meta.anchorIndex + 1), ...reordered[0]);
        anchorNode.variations = reordered.slice(1);
        if (targetPos === 0) {
          setSelection({ index: meta.anchorIndex + 1, variationPath: meta.parentPath });
        } else {
          setSelection({
            index: 0,
            variationPath: [...meta.parentPath, `${meta.anchorIndex}:${targetPos - 1}`],
          });
        }
      }
      return next;
    });
  }, [getMoveSiblingMeta]);

  const makeVariationMainline = useCallback((variationPath, index) => {
    if (!Array.isArray(variationPath) || !variationPath.length) return;
    setMainline((prev) => {
      const next = cloneLine(prev);
      const parentPath = variationPath.slice(0, -1);
      const [anchorRaw, varRaw] = String(variationPath[variationPath.length - 1]).split(':');
      if (anchorRaw === 'root') {
        const rootVarIndex = Number(varRaw);
        if (!Number.isInteger(rootVarIndex) || rootVarIndex < 0 || rootVarIndex >= (next.rootVariations || []).length) return prev;
        const chosenLine = next.rootVariations[rootVarIndex];
        const oldMainline = next.slice(0);
        next.rootVariations.splice(rootVarIndex, 1);
        if (oldMainline.length) next.rootVariations.unshift(oldMainline);
        next.splice(0, next.length, ...chosenLine);
        setSelection({ index: Number.isInteger(index) ? index : 0, variationPath: [] });
        return next;
      }
      const anchorIndex = Number(anchorRaw);
      const varIndex = Number(varRaw);
      const parentLine = getLineByPath(next, parentPath);
      const anchor = parentLine[anchorIndex];
      if (!anchor || !Number.isInteger(varIndex) || varIndex < 0 || varIndex >= anchor.variations.length) return prev;

      const chosenLine = anchor.variations[varIndex];
      const oldMainTail = parentLine.slice(anchorIndex + 1);
      anchor.variations.splice(varIndex, 1);
      if (oldMainTail.length) anchor.variations.unshift(oldMainTail);
      parentLine.splice(anchorIndex + 1, parentLine.length - (anchorIndex + 1), ...chosenLine);
      setSelection({
        index: Math.max(anchorIndex, anchorIndex + 1 + (Number.isInteger(index) ? index : 0)),
        variationPath: parentPath,
      });
      return next;
    });
  }, []);

  const deleteMovesFromSelection = useCallback((variationPath, index) => {
    if (!Array.isArray(variationPath) || !Number.isInteger(index)) return;
    setMainline((prev) => {
      const next = cloneLine(prev);
      const line = getLineByPath(next, variationPath);
      if (!line[index]) return prev;
      let nextSelection = {
        index: Math.max(-1, Math.min(index - 1, line.length - 1)),
        variationPath: variationPath,
      };
      if (index > 0) {
        const anchor = line[index - 1];
        const currentTail = line.slice(index);
        const siblings = [currentTail, ...(anchor?.variations || [])];
        const promotedTail = siblings[1] || [];
        const remainingVariations = siblings.slice(2);
        line.splice(index, line.length - index, ...promotedTail);
        if (anchor) anchor.variations = remainingVariations;
      } else if (variationPath.length > 0) {
        const parentPath = variationPath.slice(0, -1);
        const [anchorRaw, varRaw] = String(variationPath[variationPath.length - 1]).split(':');
        if (anchorRaw === 'root') {
          const rootVarIndex = Number(varRaw);
          if (Number.isInteger(rootVarIndex) && rootVarIndex >= 0 && rootVarIndex < (next.rootVariations || []).length) {
            next.rootVariations.splice(rootVarIndex, 1);
            nextSelection = { index: -1, variationPath: [] };
          } else {
            line.splice(index);
          }
        } else {
          const anchorIndex = Number(anchorRaw);
          const varIndex = Number(varRaw);
          const parentLine = getLineByPath(next, parentPath);
          const anchor = parentLine[anchorIndex];
          if (anchor && Number.isInteger(varIndex) && varIndex >= 0 && varIndex < (anchor.variations || []).length) {
            anchor.variations.splice(varIndex, 1);
            nextSelection = { index: anchorIndex, variationPath: parentPath };
          } else {
            line.splice(index);
          }
        }
      } else {
        line.splice(index);
      }
      const validSelectionKeys = buildValidSelectionKeySet(next);
      setEvalByKey((prevEval) => new Map(
        Array.from(prevEval.entries()).filter(([k]) => validSelectionKeys.has(k))
      ));
      setDepthByKey((prevDepth) => new Map(
        Array.from(prevDepth.entries()).filter(([k]) => validSelectionKeys.has(k))
      ));
      setEngineLinesByKey((prevLines) => new Map(
        Array.from(prevLines.entries()).filter(([k]) => {
          const delim = String(k).lastIndexOf('::');
          if (delim < 0) return true;
          const selKey = String(k).slice(delim + 2);
          return validSelectionKeys.has(selKey);
        })
      ));
      setUserShapesByPositionKey((prevShapes) => new Map(
        Array.from(prevShapes.entries()).filter(([k]) => {
          const delim = String(k).lastIndexOf('::');
          if (delim < 0) return true;
          const selKey = String(k).slice(delim + 2);
          return validSelectionKeys.has(selKey);
        })
      ));
      setSelection(nextSelection);
      return next;
    });
  }, []);

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
          setEngineLinesByKey((prev) => {
            const next = new Map(prev);
            next.set(`${analysisFen}::${selectionKey}`, lines);
            return next;
          });
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
          setEngineLinesByKey((prev) => {
            const next = new Map(prev);
            next.set(`${analysisFen}::${selectionKey}`, lines);
            return next;
          });
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
      setEngineLinesByKey(new Map());
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
      { infoMessage: msg = 'Imported PGN.', browseAtStart = false, evalMainlinePawns = null, orientation = null } = {}
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
      setEngineLinesByKey(new Map());
      engineStateRef.current = { key: null, depth: 0, cpWhite: null };
      setInfoMessage(msg);
      setAnalysisPlayers(parsePgnPlayerPanels(raw));
      if (orientation === 'black' || orientation === 'white') {
        setBoardOrientation(orientation);
      }
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
    let importedOrientation = null;
    let importedAnalysisPlayers = null;
    if (tacticImportPgnStashRef.current.nonce === n && tacticImportPgnStashRef.current.pgn) {
      raw = tacticImportPgnStashRef.current.pgn;
      importedEvalMainlinePawns = tacticImportPgnStashRef.current.evalMainlinePawns || null;
      importedOrientation = tacticImportPgnStashRef.current.orientation || null;
      importedAnalysisPlayers = tacticImportPgnStashRef.current.analysisPlayers || null;
    } else {
      const payload = takeAnalysisImportForNonce(n);
      raw = payload?.pgn || '';
      importedEvalMainlinePawns = payload?.evalMainlinePawns || null;
      importedOrientation = payload?.orientation || null;
      importedAnalysisPlayers = payload?.analysisPlayers || null;
      if (raw) {
        tacticImportPgnStashRef.current = {
          nonce: n,
          pgn: raw,
          evalMainlinePawns: importedEvalMainlinePawns,
          orientation: importedOrientation,
          analysisPlayers: importedAnalysisPlayers,
        };
      }
    }

    const atRaw = router.query.at;
    const at = Array.isArray(atRaw) ? atRaw[0] : atRaw;
    const browseAtStart = at === 'start';

    if (raw) {
      const parsedPlayers = parsePgnPlayerPanels(raw);
      applyImportedPgnText(raw, {
        infoMessage: 'Loaded PGN in analysis.',
        browseAtStart,
        evalMainlinePawns: importedEvalMainlinePawns,
        orientation: importedOrientation,
      });
      setAnalysisPlayers(importedAnalysisPlayers || parsedPlayers);
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

  const preselectArrow = useMemo(() => {
    const san = typeof preselectSan === 'string' ? preselectSan.trim() : '';
    if (!san || !currentFen) return null;
    try {
      const g = new Chess(currentFen, { chess960: true });
      const mv = g.move(san, { sloppy: true });
      if (!mv?.from || !mv?.to) return null;
      return { orig: mv.from, dest: mv.to, brush: PRESELECT_BRUSH_KEY };
    } catch {
      return null;
    }
  }, [currentFen, preselectSan]);

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

  const combinedAutoShapes = useMemo(() => {
    const base = Array.isArray(analysisAutoShapes) ? analysisAutoShapes : [];
    return preselectArrow ? [...base, preselectArrow] : base;
  }, [analysisAutoShapes, preselectArrow]);

  const combinedDrawableBrushes = useMemo(() => {
    const base = analysisDrawableBrushes || {};
    return { ...base, [PRESELECT_BRUSH_KEY]: PRESELECT_BRUSH };
  }, [analysisDrawableBrushes]);

  const saveStudy = useCallback(async () => {
    if (!session?.access_token) {
      setInfoMessage('Please sign in to save studies.');
      return;
    }
    if (studySaving) return;
    setStudySaving(true);
    setInfoMessage('');
    try {
      const snapshot = buildStudySnapshot();
      const title = String(studyTitle || '').trim();
      const isPublic = Boolean(studyIsPublic);
      const body = { title, isPublic, analysis: snapshot };
      const url = studyId ? `/api/studies/${encodeURIComponent(studyId)}` : '/api/studies';
      const method = studyId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Failed to save study');
      if (!studyId && payload?.id) {
        setStudyId(payload.id);
        router.replace(`/analysis?study=${encodeURIComponent(payload.id)}`, undefined, { shallow: true }).catch(() => {});
      }
      setStudyIsOwner(true);
      try {
        lastStudySavedJsonRef.current = JSON.stringify(body);
      } catch {
        lastStudySavedJsonRef.current = '';
      }
      // Saved successfully; keep quiet (autosave/manual-save UX).
    } catch (e) {
      setInfoMessage(e?.message || 'Failed to save study.');
    } finally {
      setStudySaving(false);
    }
  }, [
    session,
    studySaving,
    buildStudySnapshot,
    studyTitle,
    studyIsPublic,
    studyId,
    authHeader,
    router,
  ]);

  const deleteStudy = useCallback(async () => {
    if (!studyId || !studyIsOwner) return;
    const ok = window.confirm('Delete this study? This cannot be undone.');
    if (!ok) return;
    if (!session?.access_token) {
      setInfoMessage('Please sign in to delete studies.');
      return;
    }
    try {
      setStudySaving(true);
      const res = await fetch(`/api/studies/${encodeURIComponent(studyId)}`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Failed to delete study');
      setStudyId(null);
      setStudyTitle('');
      setStudyIsPublic(false);
      setStudyIsOwner(false);
      lastStudySavedJsonRef.current = '';
      router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
      // Deleted successfully; no banner needed.
    } catch (e) {
      setInfoMessage(e?.message || 'Failed to delete study.');
    } finally {
      setStudySaving(false);
    }
  }, [studyId, studyIsOwner, session, authHeader, router]);

  useEffect(() => {
    if (!studyId || !studyIsOwner) return;
    if (studyLoading || studySaving) return;
    if (!session?.access_token) return;

    let nextJson = '';
    try {
      const title = String(studyTitle || '').trim();
      const isPublic = Boolean(studyIsPublic);
      const analysis = buildStudySnapshot();
      nextJson = JSON.stringify({ title, isPublic, analysis });
    } catch {
      return;
    }

    if (!nextJson || nextJson === lastStudySavedJsonRef.current) return;

    const t = setTimeout(async () => {
      if (studySaving) return;
      try {
        setStudySaving(true);
        const payload = JSON.parse(nextJson);
        const res = await fetch(`/api/studies/${encodeURIComponent(studyId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify(payload),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out?.error || 'Autosave failed');
        lastStudySavedJsonRef.current = nextJson;
      } catch {
        // keep quiet; user can still hit Save manually
      } finally {
        setStudySaving(false);
      }
    }, 1500);

    return () => clearTimeout(t);
  }, [
    studyId,
    studyIsOwner,
    studyLoading,
    studySaving,
    session,
    studyTitle,
    studyIsPublic,
    buildStudySnapshot,
    authHeader,
  ]);

  return (
    <>
      <Head>
        <title>Analysis - 960 Dojo</title>
      </Head>
      <main className="page-shell openings-page openings-page--analysis">
        <SectionTitle title="Analysis" />
        {infoMessage ? <div className="alert alert--info mb-sm">{infoMessage}</div> : null}

        <div className="openings-layout">
          <div className="openings-col-board">
            <div className="training-chessboard">
              {topPanel ? (
                <div className="analysis-player-panel analysis-player-panel--top">
                  <RatingDisplay
                    className="rating-display--panel"
                    label={topPanel.name}
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
                autoShapes={combinedAutoShapes}
                extraDrawableBrushes={combinedDrawableBrushes}
                userShapes={userShapesByPositionKey.get(analysisPositionKey) || []}
                onUserShapesChange={handleUserShapesChanged}
                userDrawableBrushes={ANALYSIS_USER_BRUSHES}
              />
              {bottomPanel ? (
                <div className="analysis-player-panel analysis-player-panel--bottom">
                  <RatingDisplay
                    className="rating-display--panel"
                    label={bottomPanel.name}
                    rating={bottomPanel.atTimeRating}
                    secondaryRating={bottomPanel.currentRating}
                    profileUserId={bottomPanel.userId}
                  />
                </div>
              ) : null}
            </div>
            <div className="openings-board-head">
              <PositionDisplay value={positionNr} editable={mainline.length === 0} onChange={syncFromPositionNr} />
            </div>
            {mainline.length === 0 ? (
              <BackrankInput
                value={backrankInput}
                onChange={setBackrankInput}
                onApply={applyBackrank}
                example={EXAMPLE_BACKRANK}
              />
            ) : null}
            <div className="analysis-board-actions">
              <button
                type="button"
                className="btn btn--secondary analysis-board-actions__reset"
                onClick={() => {
                  if (studyId) {
                    router.replace('/analysis', undefined, { shallow: true }).catch(() => {});
                    resetToFreshAnalysisBoard();
                    return;
                  }
                  if (hasUnsavedScratchWork) {
                    const ok = window.confirm('Reset analysis without saving this as a study?');
                    if (!ok) return;
                  }
                  resetToFreshAnalysisBoard();
                }}
              >
                Reset analysis
              </button>
            </div>
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
              onPromoteVariation={(path, idx) => reorderMoveLine(path, idx, -1)}
              onDemoteVariation={(path, idx) => reorderMoveLine(path, idx, +1)}
              canPromoteVariation={canPromoteMove}
              canDemoteVariation={canDemoteMove}
              onMakeVariationMainline={makeVariationMainline}
              onDeleteFromMove={deleteMovesFromSelection}
              onVariationPreselectSan={setPreselectSan}
              collapseVariations={collapseVariations}
              navRight={
                <>
                  <button
                    type="button"
                    className="ml-btn"
                    onClick={() => setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))}
                    aria-label="Flip board"
                    title="Flip board"
                  >
                    ↻
                  </button>
                </>
              }
            />
            <div className="analysis-movelist-toggle-row">
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => setCollapseVariations((v) => !v)}
              >
                Collapse variations: {collapseVariations ? 'On' : 'Off'}
              </button>
            </div>
            <AnalysisCommentBox
              value={moveCommentDraft}
              disabled={false}
              onChange={(v) => {
                setMoveCommentDraft(v);
                persistSelectedComment(v);
              }}
            />
          </div>

          <div className="openings-layout-full">
            <div className="openings-layout-full__inner">
            <hr className="analysis-section-rule" aria-hidden="true" />
            <AnalysisEvalGraph
              mainline={mainline}
              evalByKey={evalByKey}
              selectedPosition={selection}
              onBrowsePositionChanged={handleBrowsePositionChanged}
            />
            <hr className="analysis-section-rule" aria-hidden="true" />
            <div className="analysis-tools-stack">
              <div className="analysis-study-row">
                <div className="analysis-study-row__left">
                  <label className="analysis-study-row__label" htmlFor="study-title">Study</label>
                  <input
                    id="study-title"
                    className="analysis-study-row__input"
                    type="text"
                    placeholder={studyId ? 'Untitled study' : 'Title (optional)'}
                    value={studyTitle}
                    disabled={Boolean(studyId) && !studyIsOwner}
                    onChange={(e) => setStudyTitle(e.target.value)}
                  />
                </div>
                <div className="analysis-study-row__right">
                  <label className="analysis-study-row__toggle">
                    <input
                      type="checkbox"
                      checked={studyIsPublic}
                      disabled={Boolean(studyId) && !studyIsOwner}
                      onChange={(e) => setStudyIsPublic(e.target.checked)}
                    />
                    <span>Public</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary"
                    disabled={!session?.access_token || studySaving || (Boolean(studyId) && !studyIsOwner)}
                    onClick={() => {
                      if (studyId) deleteStudy();
                      else saveStudy();
                    }}
                    title={!session?.access_token ? 'Sign in to manage studies' : undefined}
                  >
                    {studySaving ? 'Working…' : studyId ? 'Delete study' : 'Create study'}
                  </button>
                  <Link className="btn btn--sm btn--secondary" href="/studies">Studies</Link>
                  {studyLoading ? <span className="analysis-study-row__status">Loading…</span> : null}
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
            </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
