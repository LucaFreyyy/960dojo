import { isFiniteNumber } from './moveListEval';

/** Stored opening evals: centipawns from White's POV (see `evalFenDepthCpWhite`). */
export function evalCpWhiteToMoveListPawns(cp) {
  if (!Number.isFinite(cp)) return null;
  return cp / 100;
}

/**
 * CSS class for eval text (green / red / neutral) from the logged-in user's perspective.
 * `evalValue` is in MoveList pawns (white POV; mate encoded with |v| > 100).
 */
export function evalSummaryClass(evalValue, userColor) {
  if (!isFiniteNumber(evalValue)) return 'eval-summary--muted';
  if (Math.abs(evalValue) > 100) {
    const favorable = userColor === 'black' ? evalValue < 0 : evalValue > 0;
    return favorable ? 'eval-summary--good' : 'eval-summary--bad';
  }
  let v = evalValue;
  if (userColor === 'black') v = -v;
  if (v > 0.2) return 'eval-summary--good';
  if (v < -0.2) return 'eval-summary--bad';
  return 'eval-summary--equal';
}

export function formatEval(evalValue) {
  if (!isFiniteNumber(evalValue)) return '';
  if (Math.abs(evalValue) > 100) {
    const movesToMate = Math.max(0, Math.round(Math.abs(evalValue) - 100));
    if (movesToMate <= 0) return evalValue < 0 ? '-#' : '#';
    return evalValue < 0 ? `-#${movesToMate}` : `#${movesToMate}`;
  }
  const rounded = Math.round(evalValue * 100) / 100;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
