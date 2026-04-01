import { buildEvalTemplate, parsePgnTree, validateEvalShape } from './moveListEval';
import { buildPgnFromSans } from './openingsPgn';
import { computeFenTrail } from './openingsGame';

/** Stockfish analysis depth during the game (centipawns, white POV). */
export const OPENINGS_EVAL_DEPTH_MOVE = 12;
/** Final position analysis depth after the line ends. */
export const OPENINGS_EVAL_DEPTH_FINAL = 20;

function isMateEncoded(evalValue) {
  return Number.isFinite(evalValue) && Math.abs(evalValue) > 100;
}

/** Stored evals are White POV: pawns for normal evals, ±(100+N) for mate in N. */
export function evalHistoryCpToMoveListPawns(cpArray) {
  return cpArray.map((cp) => {
    if (!Number.isFinite(cp)) return 0;
    if (isMateEncoded(cp)) return cp;
    return cp;
  });
}

/**
 * Build nested eval array for MoveList from parallel centipawn history (white POV).
 * Uses 0 only for missing slots before validation (finalize should fill the last index).
 */
export function buildMoveListEvalDataFromTrail(startFen, sans, trailWhiteCp) {
  const tree = parsePgnTree(buildPgnFromSans(startFen, sans));
  const template = buildEvalTemplate(tree);
  const len = computeFenTrail(startFen, sans).length;
  const evalData = evalHistoryCpToMoveListPawns(
    Array.from({ length: len }, (_, i) => (Number.isFinite(trailWhiteCp[i]) ? trailWhiteCp[i] : 0))
  );
  return validateEvalShape(evalData, template) ? evalData : null;
}
