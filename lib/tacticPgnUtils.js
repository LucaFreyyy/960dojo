import { Chess } from './chessCompat';

/**
 * Puzzle lines from the DB are opponent-first (index 0 auto-played), then alternate.
 * Many PGNs include one extra opponent half-move after the user's final move; drop it so
 * the puzzle completes on the user's move (same as ending one half-move earlier).
 */
export function trimTrailingOpponentMoveFromPuzzleLine(parsedLine) {
  if (!Array.isArray(parsedLine) || parsedLine.length < 2) return parsedLine;
  const lastIdx = parsedLine.length - 1;
  // Even index = opponent; odd = user. Truncate only when the last ply is opponent's reply.
  if (lastIdx % 2 === 0) {
    return parsedLine.slice(0, -1);
  }
  return parsedLine;
}

/** Extract a PGN header tag value, e.g. `[FEN "..."]` → the quoted string. */
export function extractPgnTag(pgn, tag) {
  if (typeof pgn !== 'string') return null;
  const re = new RegExp(`^\\[${tag} "([^"]*)"\\]$`, 'm');
  const m = pgn.match(re);
  return m?.[1] || null;
}

/** Parse SAN tokens from a tactic/game PGN movetext (headers stripped). */
export function parseSanMovesFromPgn(pgn) {
  if (typeof pgn !== 'string') return [];
  const body = pgn
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const out = [];
  for (const token of body.split(' ')) {
    if (!token) continue;
    if (/^\d+\.(\.\.)?$/.test(token) || /^\d+\.\.\.$/.test(token)) continue;
    const cleaned = token
      .replace(/^\d+\.(\.\.)?/, '')
      .replace(/^\d+\.\.\./, '')
      .replace(/[?!]+/g, '')
      .trim();
    if (cleaned) out.push(cleaned);
  }
  return out;
}

/**
 * Board orientation for tactics: user's pieces at the bottom (same rule as the tactics page).
 * Puzzle lines are opponent-first; we play the first SAN when present, otherwise assume the
 * side to move at startFen is the opponent.
 */
export function orientationForTacticPuzzle({ startFen = null, pgn = null } = {}) {
  const fen = (typeof startFen === 'string' && startFen.trim())
    ? startFen.trim()
    : (typeof pgn === 'string' ? extractPgnTag(pgn, 'FEN') : null);
  if (!fen) return 'white';

  try {
    const game = new Chess(fen, { chess960: true });
    const line = trimTrailingOpponentMoveFromPuzzleLine(
      parseSanMovesFromPgn(typeof pgn === 'string' ? pgn : '')
    );
    if (line.length > 0) {
      const first = game.move(line[0], { sloppy: true });
      if (first) {
        return game.turn() === 'b' ? 'black' : 'white';
      }
    }
    return game.turn() === 'w' ? 'black' : 'white';
  } catch {
    return 'white';
  }
}
