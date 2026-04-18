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
