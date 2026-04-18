/**
 * Minimal PGN text for archiving live games (chessops-backed; no chess.js).
 */
function sansToMovetext(sans) {
  const parts = [];
  for (let i = 0; i < sans.length; i++) {
    if (i % 2 === 0) parts.push(`${Math.floor(i / 2) + 1}.`);
    parts.push(sans[i]);
  }
  return parts.join(' ');
}

/**
 * @param {object} game - play game with moves[].san, initialFen, resultCode, etc.
 * @param {Record<string, string>} headerTags - PGN header keys
 */
export function buildArchivePgn(game, headerTags) {
  const lines = [];
  for (const [key, value] of Object.entries(headerTags)) {
    const esc = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    lines.push(`[${key} "${esc}"]`);
  }
  const sans = (game.moves || []).map((m) => m.san).filter(Boolean);
  const movetext = sans.length ? `${sansToMovetext(sans)} ${game.resultCode || '*'}` : game.resultCode || '*';
  lines.push('');
  lines.push(movetext);
  return lines.join('\n');
}
