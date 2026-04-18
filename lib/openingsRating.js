/**
 * @param {number} finalCpWhite - final position eval (White POV): centipawns, or mate encoding ±((100+N)*100)
 * @param {'white'|'black'} userColor
 * @param {number} openingsRatingCount - count of `Rating` rows with type openings
 */
export function computeOpeningsRatingDelta(finalCpWhite, userColor, openingsRatingCount) {
  const mult = openingsRatingCount < 10 ? Math.max(1, 10 - openingsRatingCount) : 1;
  const isMateEncoded = Number.isFinite(finalCpWhite) && Math.abs(finalCpWhite) > 10000;
  const finalPawns = Number.isFinite(finalCpWhite) ? finalCpWhite / 100 : 0;
  let adj = isMateEncoded ? (finalCpWhite > 0 ? 3 : -3) : Math.max(-3, Math.min(3, finalPawns));
  if (userColor === 'black') adj = -adj;
  return Math.round(adj * 10 * mult);
}
