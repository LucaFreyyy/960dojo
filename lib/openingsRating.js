/**
 * @param {number} finalCpWhite - final position eval in centipawns (White POV)
 * @param {'white'|'black'} userColor
 * @param {number} openingsRatingCount - count of `Rating` rows with type openings
 */
export function computeOpeningsRatingDelta(finalCpWhite, userColor, openingsRatingCount) {
  const mult = openingsRatingCount < 10 ? Math.max(1, 10 - openingsRatingCount) : 1;
  const finalPawns = Number.isFinite(finalCpWhite) ? finalCpWhite / 100 : 0;
  let adj = Math.max(-3, Math.min(3, finalPawns));
  if (userColor === 'black') adj = -adj;
  return Math.round(adj * 10 * mult);
}
