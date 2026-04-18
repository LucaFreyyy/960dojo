import { makeUci } from 'chessops/util';
import { parseSquare } from 'chessops/util';
import { Chess } from './chessCompat';
import { applyBoardMoveToChessGame } from './openingsGame';

/** Board + side + castling + ep — ignore halfmove/fullmove when comparing FENs. */
export function fenCoreForCompare(fen) {
  if (!fen || typeof fen !== 'string') return '';
  const p = fen.trim().split(/\s+/);
  return p.slice(0, 4).join(' ');
}

/**
 * Replay stored chessops UCI moves (same wire format as Lichess / engines).
 */
export function compatFromState(game) {
  const g = new Chess(game.initialFen);
  for (const m of game.moves || []) {
    const r = g.moveFromUci(m.uci);
    if (!r) throw new Error(`Replay failed at uci=${m.uci}`);
  }
  return g;
}

/** Convert a chessCompat {@link Chess#move} result to chessops UCI (canonical castling, etc.). */
export function compatAppliedToUci(applied) {
  const from = parseSquare(applied.from);
  const to = parseSquare(applied.to);
  if (from === undefined || to === undefined) {
    throw new Error(`compatAppliedToUci: invalid squares from=${applied.from} to=${applied.to}`);
  }
  return makeUci({ from, to, promotion: applied.promotion });
}

/**
 * Apply the board move the same way as analysis / openings (chessops only), then return the
 * canonical UCI for storage.
 */
export function applyPlayMoveOrThrow(game, { from, to, san, promotion }) {
  const g = compatFromState(game);
  const applied = applyBoardMoveToChessGame(g, from, to, san, promotion ?? null);
  if (!applied) {
    throw new Error('Illegal move: applyBoardMoveToChessGame could not apply from/to/san');
  }
  const uci = compatAppliedToUci(applied);
  return { applied, uci, compat: g };
}
