import { useCallback, useRef } from 'react';

/**
 * Pairs {@link Chessboard}'s `onWheelNavigate` with {@link MoveList}'s imperative `stepPrevious` / `stepNext`
 * (same as arrow keys). Use `ref={moveListNavRef}` on MoveList and `onWheelNavigate={onWheelNavigate}` on Chessboard.
 */
export function useMoveListWheelNavigation() {
  const moveListNavRef = useRef(null);
  const onWheelNavigate = useCallback((dir) => {
    const nav = moveListNavRef.current;
    if (!nav) return;
    if (dir < 0) nav.stepPrevious();
    else nav.stepNext();
  }, []);
  return { moveListNavRef, onWheelNavigate };
}
