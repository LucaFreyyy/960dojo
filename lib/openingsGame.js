import { Chess } from './chessCompat';

/** Compare SAN strings across notation quirks (checks, suffixes, zeros). */
function normalizeSanForCompare(san) {
  if (typeof san !== 'string') return '';
  return san
    .replace(/[?!]+/g, '')
    .replace(/[+#]+/g, '')
    .replace(/^0-0-0$/i, 'O-O-O')
    .replace(/^0-0$/i, 'O-O')
    .trim();
}

function normalizePromotionFromBoard(p) {
  if (!p) return undefined;
  const s = String(p).toLowerCase();
  if (s === 'q' || s === 'queen') return 'queen';
  if (s === 'r' || s === 'rook') return 'rook';
  if (s === 'b' || s === 'bishop') return 'bishop';
  if (s === 'n' || s === 'knight') return 'knight';
  return undefined;
}

/**
 * Apply a move from the board (chessops/chessground) to our chessops-backed game.
 * Tries SAN first; falls back to from/to + promotion so chess960 notation mismatches cannot block play.
 */
export function applyBoardMoveToChessGame(g, from, to, sanFromBoard, promotionFromBoard = null) {
  let m = null;
  try {
    m = g.move(sanFromBoard, { sloppy: true });
  } catch {
    m = null;
  }
  if (m) return m;

  const promo = normalizePromotionFromBoard(promotionFromBoard);
  if (promo) {
    m = g.move({ from, to, promotion: promo });
    if (m) return m;
  }

  const legal = g.moves({ verbose: true });
  const sanNorm = normalizeSanForCompare(sanFromBoard);

  // Chess960 castling often comes as king->rook-square from the UI (e.g. f8->h8),
  // while legal move generation can use the king destination square (e.g. f8->g8).
  // So we must allow SAN-based matching even when `to` differs.
  const sanMatches = legal.filter((mv) => normalizeSanForCompare(mv.san) === sanNorm);
  const exact = legal.filter((mv) => mv.from === from && mv.to === to);
  const fromOnly = legal.filter((mv) => mv.from === from);

  const picked =
    exact.find((mv) => normalizeSanForCompare(mv.san) === sanNorm) ||
    sanMatches.find((mv) => mv.from === from) ||
    sanMatches[0] ||
    exact[0] ||
    fromOnly.find((mv) => mv.to === to) ||
    fromOnly[0] ||
    null;

  if (!picked) return null;
  const move = { from: picked.from, to: picked.to };
  if (picked.promotion) move.promotion = picked.promotion;
  return g.move(move);
}

/** Board + side to move + castling + ep (ignore halfmove/fullmove — chessops vs our FEN can differ). */
function fenCoreForCompare(fen) {
  if (!fen || typeof fen !== 'string') return '';
  const p = fen.trim().split(/\s+/);
  return p.slice(0, 4).join(' ');
}

/**
 * When SAN/from-to matching fails (chessops vs chess.js edge cases), find the unique legal move
 * that reaches the FEN the board already applied (e.g. premoves).
 */
export function applyMoveMatchingTargetFen(g, targetFen) {
  if (!targetFen || typeof targetFen !== 'string') return null;
  const want = targetFen.trim();
  const wantCore = fenCoreForCompare(want);
  const legal = g.moves({ verbose: true });
  const matches = [];
  for (const mv of legal) {
    const trial = new Chess(g.fen());
    const played = trial.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    if (!played) continue;
    const got = trial.fen().trim();
    if (got === want || fenCoreForCompare(got) === wantCore) matches.push(mv);
  }
  if (matches.length !== 1) return null;
  const only = matches[0];
  const move = { from: only.from, to: only.to };
  if (only.promotion) move.promotion = only.promotion;
  return g.move(move);
}

export function computeFenTrail(startFen, sans) {
  const g = new Chess(startFen, { chess960: true });
  const trail = [g.fen()];
  for (const san of sans) {
    const m = g.move(san, { sloppy: true });
    if (!m) break;
    trail.push(g.fen());
  }
  return trail;
}

export function countUserMovesFromSans(startFen, sans, userColor) {
  const g = new Chess(startFen, { chess960: true });
  let userMoves = 0;
  for (const san of sans) {
    const turnBefore = g.turn();
    const m = g.move(san, { sloppy: true });
    if (!m) break;
    const movedUser =
      (userColor === 'white' && turnBefore === 'w') || (userColor === 'black' && turnBefore === 'b');
    if (movedUser) userMoves += 1;
  }
  return userMoves;
}

export function sideToMoveFromFen(fen) {
  const t = fen.split(/\s+/)[1];
  return t === 'b' ? 'black' : 'white';
}
