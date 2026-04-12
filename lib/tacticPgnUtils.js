/** Extract a PGN header tag value, e.g. `[FEN "..."]` → the quoted string. */
export function extractPgnTag(pgn, tag) {
  if (typeof pgn !== 'string') return null;
  const re = new RegExp(`^\\[${tag} "([^"]*)"\\]$`, 'm');
  const m = pgn.match(re);
  return m?.[1] || null;
}
