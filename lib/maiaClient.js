/**
 * maiaClient.js
 * Runs Maia inference entirely in the browser using ONNX Runtime Web.
 * The 255 MB model is downloaded once and cached in IndexedDB.
 */
import * as ort from 'onnxruntime-web';
import { Chess } from './chessCompat';

// ── IndexedDB cache ────────────────────────────────────────────────────────────
const DB_NAME    = 'maiaModelCache';
const DB_VERSION = 1;
const STORE      = 'models';
const MODEL_KEY  = 'best.onnx';

let _dbPromise = null;
function openDb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess       = () => resolve(req.result);
    req.onerror         = () => reject(req.error);
  });
  return _dbPromise;
}

async function getCachedModel() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(MODEL_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch { return null; }
}

async function setCachedModel(buffer) {
  try {
    const db = await openDb();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(buffer, MODEL_KEY);
      tx.oncomplete = resolve;
      tx.onerror    = resolve; // don't crash if storage is full
    });
  } catch {}
}

// ── Singletons ─────────────────────────────────────────────────────────────────
let _session   = null;
let _movesData = null;

async function loadSession(onProgress) {
  if (_session) return _session;

  let buffer = await getCachedModel();

  if (!buffer) {
    onProgress?.('Downloading Maia model (255 MB, cached after first use)…');
    const res = await fetch('/maia_model/best.onnx');
    if (!res.ok) throw new Error(`Failed to fetch model: ${res.status}`);
    buffer = await res.arrayBuffer();
    await setCachedModel(buffer);
  }

  onProgress?.('Loading model into ONNX runtime…');
  _session = await ort.InferenceSession.create(buffer, {
    executionProviders: ['wasm'],
  });
  return _session;
}

async function loadMovesData() {
  if (_movesData) return _movesData;
  const res = await fetch('/maia_model/moves.json');
  if (!res.ok) throw new Error(`Failed to fetch moves.json: ${res.status}`);
  _movesData = await res.json();
  return _movesData;
}

// ── Preprocessing helpers (direct ports of maia2/inference.py) ─────────────────

function mirrorSquare(sq) {
  return sq[0] + String(9 - parseInt(sq[1]));
}

function mirrorMove(uci) {
  return mirrorSquare(uci.slice(0, 2)) +
         mirrorSquare(uci.slice(2, 4)) +
         (uci.length > 4 ? uci[4] : '');
}

/**
 * Mirror a FEN string so the side to move is always White.
 * Matches python-chess Board.mirror():
 *   - reverse ranks, swap piece colours
 *   - swap castling rights case (K↔k, Q↔q, and Chess960 A-H ↔ a-h)
 *   - mirror en-passant rank
 */
function mirrorFen(fen) {
  const [board, , castling, ep, half, full] = fen.split(' ');

  const mirroredBoard = board.split('/').reverse()
    .map(rank => rank.replace(/[a-zA-Z]/g, c =>
      c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
    )).join('/');

  // Swap case — works for both "KQkq" and Chess960 "AHah" notation
  const mirroredCastling = castling === '-' ? '-' :
    castling.replace(/[A-Za-z]/g, c =>
      c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
    );

  const mirroredEp = ep === '-' ? '-' :
    ep[0] + String(9 - parseInt(ep[1]));

  return `${mirroredBoard} w ${mirroredCastling} ${mirroredEp} ${half} ${full}`;
}

/** map_to_category — identical logic to the Python version */
function mapToCategory(elo, eloDict) {
  if (elo < 1100) return eloDict['<1100'];
  if (elo >= 2000) return eloDict['>=2000'];
  const lower = Math.floor((elo - 1100) / 100) * 100 + 1100;
  return eloDict[`${lower}-${lower + 99}`];
}

/**
 * board_to_tensor — port of maia2/inference.py board_to_tensor().
 * Returns a Float32Array of shape [18, 8, 8] laid out as [channel][row][col],
 * where row 0 = rank 1, col 0 = file a  (matching python-chess square encoding).
 *
 * Channels:
 *   0-5   White pieces  (P N B R Q K)
 *   6-11  Black pieces  (P N B R Q K)
 *   12    Side to move  (all-1 if White)
 *   13    White kingside  castling right  (all-1 if available)
 *   14    White queenside castling right
 *   15    Black kingside  castling right
 *   16    Black queenside castling right
 *   17    En-passant target square  (single 1)
 */
function fenToTensor(processedFen) {
  const [boardStr, turn, castling, ep] = processedFen.split(' ');
  const tensor = new Float32Array(18 * 8 * 8);
  const PIECE_IDX = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  // ── Piece channels ──────────────────────────────────────────────────────────
  const ranks = boardStr.split('/');
  for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
    const row = 7 - rankIdx; // FEN rank 0 = rank 8; python-chess row 0 = rank 1
    let col = 0;
    for (const c of ranks[rankIdx]) {
      if (c >= '1' && c <= '8') {
        col += parseInt(c);
      } else {
        const isWhite    = c === c.toUpperCase();
        const pieceType  = c.toLowerCase();
        const channel    = PIECE_IDX[pieceType] + (isWhite ? 0 : 6);
        tensor[channel * 64 + row * 8 + col] = 1.0;
        col++;
      }
    }
  }

  // ── Turn channel (12) ───────────────────────────────────────────────────────
  if (turn === 'w') {
    for (let i = 0; i < 64; i++) tensor[12 * 64 + i] = 1.0;
  }

  // ── Castling channels (13-16) ───────────────────────────────────────────────
  if (castling !== '-') {
    // For Chess960 we need king file to classify rook as kingside/queenside
    let wKingFile = -1, bKingFile = -1;
    const findKingFile = (rankStr, kingChar) => {
      let f = 0;
      for (const c of rankStr) {
        if (c >= '1' && c <= '8') f += parseInt(c);
        else { if (c === kingChar) return f; f++; }
      }
      return -1;
    };
    wKingFile = findKingFile(ranks[7], 'K'); // rank 1
    bKingFile = findKingFile(ranks[0], 'k'); // rank 8

    const fillChannel = (ch) => { for (let i = 0; i < 64; i++) tensor[ch * 64 + i] = 1.0; };

    for (const c of castling) {
      if      (c === 'K') fillChannel(13);
      else if (c === 'Q') fillChannel(14);
      else if (c === 'k') fillChannel(15);
      else if (c === 'q') fillChannel(16);
      else if (c >= 'A' && c <= 'H') { // Chess960 white rook
        const rookFile = c.charCodeAt(0) - 65;
        if (wKingFile >= 0) fillChannel(rookFile > wKingFile ? 13 : 14);
      } else if (c >= 'a' && c <= 'h') { // Chess960 black rook
        const rookFile = c.charCodeAt(0) - 97;
        if (bKingFile >= 0) fillChannel(rookFile > bKingFile ? 15 : 16);
      }
    }
  }

  // ── En-passant channel (17) ─────────────────────────────────────────────────
  if (ep !== '-') {
    const col = ep.charCodeAt(0) - 97; // 'a' = 97
    const row = parseInt(ep[1]) - 1;
    tensor[17 * 64 + row * 8 + col] = 1.0;
  }

  return tensor;
}

/** Return UCI strings for all legal moves in a (possibly mirrored) FEN */
function getLegalMovesUci(processedFen) {
  const chess = new Chess(processedFen, { chess960: true });
  return chess.moves({ verbose: true })
    .map(m => m.from + m.to + (m.promotion || ''));
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Run Maia inference in the browser.
 * Returns { uci, san } or null on failure.
 * @param {object} opts
 * @param {string} opts.fen
 * @param {number} opts.rating       — elo of the player to move
 * @param {number} [opts.opponentRating]
 * @param {function} [opts.onProgress] — called with status strings while loading
 */
export async function getMaiaMoveClient({ fen, rating = 1500, opponentRating, onProgress }) {
  const eloSelf = Math.round(Number(rating)          || 1500);
  const eloOppo = Math.round(Number(opponentRating)  || eloSelf);
  const isBlack = fen.split(' ')[1] === 'b';

  const processedFen = isBlack ? mirrorFen(fen) : fen;

  // Load model + moves data in parallel
  const [session, movesData] = await Promise.all([
    loadSession(onProgress),
    loadMovesData(),
  ]);
  const { allMovesDict, eloDict, allMovesDictReversed } = movesData;

  // Build inputs
  const boardTensor  = fenToTensor(processedFen);
  const eloSelfCat   = mapToCategory(eloSelf, eloDict);
  const eloOppoCat   = mapToCategory(eloOppo, eloDict);

  // Legal moves mask (length = 1880)
  const numMoves  = Object.keys(allMovesDict).length;
  const legalMask = new Float32Array(numMoves);
  for (const uci of getLegalMovesUci(processedFen)) {
    const idx = allMovesDict[uci];
    if (idx !== undefined) legalMask[idx] = 1.0;
  }

  // ONNX inference
  const feeds = {
    board_input: new ort.Tensor('float32', boardTensor, [1, 18, 8, 8]),
    elo_self:    new ort.Tensor('int64', BigInt64Array.from([BigInt(eloSelfCat)]), [1]),
    elo_oppo:    new ort.Tensor('int64', BigInt64Array.from([BigInt(eloOppoCat)]), [1]),
  };
  const results = await session.run(feeds);
  const logits  = results.logits_maia.data; // Float32Array [1880]

  // Argmax over legal moves only
  let bestIdx = -1;
  let bestVal = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (legalMask[i] > 0 && logits[i] > bestVal) {
      bestVal = logits[i];
      bestIdx = i;
    }
  }
  if (bestIdx < 0) return null;

  // Map back to original orientation
  let uci = allMovesDictReversed[String(bestIdx)];
  if (isBlack) uci = mirrorMove(uci);

  // Derive SAN via chess.js
  try {
    const game  = new Chess(fen, { chess960: true });
    const from  = uci.slice(0, 2);
    const to    = uci.slice(2, 4);
    const promo = uci.length > 4 ? uci[4] : undefined;
    const move  = game.move({ from, to, promotion: promo });
    if (move) return { uci, san: move.san };
  } catch {}

  return { uci, san: null };
}