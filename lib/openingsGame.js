import { Chess } from './chessCompat';

export function normalizePromotionFromBoard(p) {
  if (!p) return undefined;
  const s = String(p).toLowerCase();
  if (s === 'q' || s === 'queen') return 'queen';
  if (s === 'r' || s === 'rook') return 'rook';
  if (s === 'b' || s === 'bishop') return 'bishop';
  if (s === 'n' || s === 'knight') return 'knight';
  return undefined;
}

/**
 * Apply the drag the board already validated: same chessops rules as Chessground (`toDests` + `makeMove`).
 * No SAN fallbacks — if replay position `g` matches the UI, `from`/`to`/`promotion` are enough.
 * Openings can still call {@link applyMoveMatchingTargetFen} when the FEN is already applied (premove).
 */
export function applyBoardMoveToChessGame(g, from, to, _sanFromBoard, promotionFromBoard = null) {
  const promo = normalizePromotionFromBoard(promotionFromBoard);
  return g.move({ from, to, promotion: promo });
}

/** Board + side to move + castling + ep (ignore halfmove/fullmove — chessops vs our FEN can differ). */
function fenCoreForCompare(fen) {
  if (!fen || typeof fen !== 'string') return '';
  const p = fen.trim().split(/\s+/);
  return p.slice(0, 4).join(' ');
}

/**
 * When SAN/from-to matching fails, find the unique legal move
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
