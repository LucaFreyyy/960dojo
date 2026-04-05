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
  /**
   * When true, the side given by `movableColor` may queue a premove while it is not their turn.
   * Chess960: castling premoves use standard-chess king-on-e-file logic in chessground, so those are off.
   */
  premoveEnabled = false,
  premovableCastle = false,
}) {
  const containerRef = useRef(null);
  const positionRef = useRef(null);
  const orientationRef = useRef(orientation);
  const onMoveRef = useRef(onMove);
  const onPositionChangeRef = useRef(onPositionChange);
  const movableColorRef = useRef(movableColor);
  const disabledRef = useRef(disabled);
  const premoveEnabledRef = useRef(premoveEnabled);
  const premovableCastleRef = useRef(premovableCastle);
  const [ground, setGround] = useState(null);

  useEffect(() => {
    movableColorRef.current = movableColor;
  }, [movableColor]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    premoveEnabledRef.current = premoveEnabled;
  }, [premoveEnabled]);

  useEffect(() => {
    premovableCastleRef.current = premovableCastle;
  }, [premovableCastle]);

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
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
      },
      movable: {
        free: false,
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
        events: {
          after: (orig, dest, metadata) => {
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
              onMoveRef.current({ from: orig, to: dest, san, newFen, premove: !!metadata?.premove });
            }
            if (onPositionChangeRef.current) {
              onPositionChangeRef.current(newFen);
            }

            cg.set({
              fen: newFen,
              turnColor: turnColorFromFen(newFen),
              orientation: orientationRef.current,
              premovable: {
                enabled: premoveEnabledRef.current && !disabledRef.current,
                showDests: true,
                castle: premovableCastleRef.current,
              },
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
  }, [fen, ground, orientation, disabled, movableColor, premoveEnabled, premovableCastle]);

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
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
      },
      movable: {
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
      },
    });
    if (premoveEnabled && !disabled) {
      ground.playPremove();
    } else {
      ground.cancelPremove();
    }
  }, [fen, ground, disabled, lastMove, movableColor, premoveEnabled, premovableCastle]);

  useEffect(() => {
    if (!ground) return;

    orientationRef.current = orientation;
    ground.set({
      orientation: orientationRef.current,
      turnColor: turnColorFromFen(fen),
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
      },
      movable: {
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
      },
    });
  }, [fen, orientation, ground, disabled, movableColor, premoveEnabled, premovableCastle]);

  useEffect(() => {
    if (!ground) return;
    ground.set({
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
      },
    });
  }, [ground, premoveEnabled, premovableCastle, disabled]);

  if (!fen) {
    return (
      <div className="chessboard-placeholder">
        Loading board...
      </div>
    );
  }

  return <div ref={containerRef} className="chessboard-root" />;
}
