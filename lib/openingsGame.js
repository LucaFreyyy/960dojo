import { Chess } from 'chess.js';

/**
 * Compare SAN strings across chess.js / chessops quirks (960 castling, checks).
 */
function normalizeSanForCompare(san) {
  if (typeof san !== 'string') return '';
  return san
    .replace(/[?!]+/g, '')
    .replace(/[+#]+/g, '')
    .replace(/^0-0-0$/i, 'O-O-O')
    .replace(/^0-0$/i, 'O-O')
    .trim();
}

/**
 * Apply a move from the board (chessops/chessground) to a chess.js game.
 * Tries SAN first; falls back to from/to + promotion so chess960 notation mismatches cannot block play.
 */
export function applyBoardMoveToChessGame(g, from, to, sanFromBoard) {
  let m = g.move(sanFromBoard, { sloppy: true });
  if (m) return m;
  const candidates = g.moves({ verbose: true }).filter((mv) => mv.from === from && mv.to === to);
  if (!candidates.length) return null;
  const picked =
    candidates.find(
      (c) => normalizeSanForCompare(c.san) === normalizeSanForCompare(sanFromBoard)
    ) || candidates[0];
  const move = { from: picked.from, to: picked.to };
  if (picked.promotion) move.promotion = picked.promotion;
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
