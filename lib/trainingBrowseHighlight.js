import { Chess } from './chessCompat';

/**
 * Halfmove list (mainline) + ply index of the move to highlight (the move that led to this position).
 * MoveList uses index -1 for start; index k means position after mainlineSans[k].
 * @returns {string[]|undefined} `[from, to]` squares or undefined when no move to show
 */
export function lastMoveSquaresAtMainlineSansIndex(startFen, sans, mainlineMoveIndex) {
  if (!startFen || !Array.isArray(sans) || mainlineMoveIndex < 0 || mainlineMoveIndex >= sans.length) {
    return undefined;
  }
  const g = new Chess(startFen, { chess960: true });
  for (let i = 0; i < mainlineMoveIndex; i += 1) {
    try {
      const mv = g.move(sans[i], { sloppy: true });
      if (!mv) return undefined;
    } catch {
      return undefined;
    }
  }
  try {
    const mv = g.move(sans[mainlineMoveIndex], { sloppy: true });
    if (!mv) return undefined;
    return [mv.from, mv.to];
  } catch {
    return undefined;
  }
}

/**
 * Tactics failed-try line: replay `lineSans[0..anchorIndex]` then play `wrongSan` (matches `failedVariationFenByKey`).
 */
export function lastMoveSquaresForFailedTry(startFen, lineSans, anchorIndex, wrongSan) {
  if (!startFen || !wrongSan || !Array.isArray(lineSans)) return undefined;
  const g = new Chess(startFen, { chess960: true });
  const n = Math.min(Math.max(0, anchorIndex) + 1, lineSans.length);
  for (let i = 0; i < n; i += 1) {
    try {
      const mv = g.move(lineSans[i], { sloppy: true });
      if (!mv) return undefined;
    } catch {
      return undefined;
    }
  }
  try {
    const mv = g.move(wrongSan, { sloppy: true });
    if (!mv) return undefined;
    return [mv.from, mv.to];
  } catch {
    return undefined;
  }
}

function pathsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

/**
 * Tactics: derive board lastMove from browse selection + line for display + optional failed variation.
 */
export function tacticsBoardLastMove(startFen, lineForDisplay, browsePosition, failedVariation) {
  if (!startFen || !browsePosition) return undefined;
  const vp = browsePosition.variationPath || [];
  if (
    failedVariation
    && pathsEqual(vp, failedVariation.path)
    && browsePosition.index === 0
  ) {
    return lastMoveSquaresForFailedTry(
      startFen,
      lineForDisplay,
      failedVariation.anchorIndex,
      failedVariation.san
    );
  }
  return lastMoveSquaresAtMainlineSansIndex(startFen, lineForDisplay, browsePosition.index);
}
