/**
 * `UserOpening` insert shape (rated flow): id, userId, openingNr, color, pgn, evalHistory, finished.
 */

export function createRatedOpeningRow({ id, userId, openingNr, color }) {
  return {
    id,
    userId,
    openingNr,
    color,
    pgn: '',
    evalHistory: [],
    finished: null,
  };
}
