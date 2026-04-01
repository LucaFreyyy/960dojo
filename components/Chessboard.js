import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { createPosition, toDests, makeMove, turnColorFromFen } from '../lib/chessopsUtils';

const DBG = process.env.NODE_ENV === 'development';

export default function ChessBoard({
  fen,
  orientation = 'white',
  onMove,
  onPositionChange,
  disabled = false,
  lastMove,
  /** 'white' | 'black' | 'both' — who may drag pieces */
  movableColor = 'both',
}) {
  const containerRef = useRef(null);
  const positionRef = useRef(null);
  const orientationRef = useRef(orientation);
  const onMoveRef = useRef(onMove);
  const onPositionChangeRef = useRef(onPositionChange);
  const movableColorRef = useRef(movableColor);
  const disabledRef = useRef(disabled);
  const [ground, setGround] = useState(null);

  useEffect(() => {
    movableColorRef.current = movableColor;
  }, [movableColor]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  // Initialize once when a valid fen exists.
  useEffect(() => {
    if (ground || !fen || !containerRef.current) return;
    positionRef.current = createPosition(fen);
    if (!positionRef.current) return;

    const cg = Chessground(containerRef.current, {
      fen: fen,
      orientation: orientation,
      autoCastle: false,
      turnColor: turnColorFromFen(fen),
      movable: {
        free: false,
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
        events: {
          after: (orig, dest, metadata) => {
            if (DBG && metadata?.premove) {
              console.warn('[Chessboard] after callback with premove=true', { orig, dest });
            }
            let san;
            let newFen;
            try {
              ({ san, newFen } = makeMove(positionRef.current, orig, dest));
            } catch (e) {
              console.error('[Chessboard] makeMove failed', { orig, dest, fen, err: String(e) });
              return;
            }
            if (DBG && (san === 'O-O' || san === 'O-O-O')) {
              console.log('[Chessboard] castling', { san, orig, dest, before: fen, after: newFen });
            }

            if (onMoveRef.current) {
              onMoveRef.current({ from: orig, to: dest, san, newFen });
            }
            if (onPositionChangeRef.current) {
              onPositionChangeRef.current(newFen);
            }

            cg.set({
              fen: newFen,
              turnColor: turnColorFromFen(newFen),
              orientation: orientationRef.current,
              movable: {
                color: disabledRef.current ? 'none' : movableColorRef.current,
                dests: toDests(positionRef.current),
              },
              lastMove: [orig, dest],
            });
          },
        },
      },
    });
    setGround(cg);
  }, [fen, ground, orientation, disabled, movableColor]);

  useEffect(() => () => {
    if (!ground) return;
    try { ground.destroy(); } catch {}
  }, [ground]);

  useEffect(() => {
    if (!ground || !fen) return;

    const newPosition = createPosition(fen);
    if (!newPosition) return;

    positionRef.current = newPosition;

    ground.set({
      fen: fen,
      turnColor: turnColorFromFen(fen),
      lastMove: Array.isArray(lastMove) ? lastMove : undefined,
      movable: {
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
      },
    });
  }, [fen, ground, disabled, lastMove, movableColor]);

  useEffect(() => {
    if (!ground) return;

    orientationRef.current = orientation;
    ground.set({
      orientation: orientationRef.current,
      turnColor: turnColorFromFen(fen),
      movable: {
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
      },
    });
  }, [fen, orientation, ground, disabled, movableColor]);

  if (!fen) {
    return (
      <div className="chessboard-placeholder">
        Loading board...
      </div>
    );
  }

  return <div ref={containerRef} className="chessboard-root" />;
}
