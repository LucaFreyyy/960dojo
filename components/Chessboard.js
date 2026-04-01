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
      movable: {
        free: false,
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
        events: {
          after: (orig, dest) => {
            const { san, newFen } = makeMove(positionRef.current, orig, dest);

            if (onMoveRef.current) {
              onMoveRef.current({ from: orig, to: dest, san, newFen });
            }
            if (onPositionChangeRef.current) {
              onPositionChangeRef.current(newFen);
            }

            cg.set({
              fen: newFen,
              orientation: orientationRef.current,
              movable: {
                color: disabledRef.current ? 'none' : movableColorRef.current,
                dests: toDests(positionRef.current),
              },
              lastMove: [orig, dest],
            });
          }
        }
      }
    });
    setGround(cg);
  }, [fen, ground, orientation, disabled, movableColor]);

  useEffect(() => () => {
    if (!ground) return;
    try { ground.destroy(); } catch {}
  }, [ground]);

  // FEN got updated: Setup new game
  useEffect(() => {
    if (!ground || !fen) return;

    // Create new position from FEN
    const newPosition = createPosition(fen);
    if (!newPosition) return;

    positionRef.current = newPosition;

    // Update ground instance (visu)
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

  // orientation got updated: Flip the board
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
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          aspectRatio: '1 / 1',
          background: '#0f131a',
          border: '1px solid #2f3644',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9fb0cf',
          fontWeight: 700,
        }}
      >
        Loading board...
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', maxWidth: '560px', aspectRatio: '1 / 1' }} />;
};
