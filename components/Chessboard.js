import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { createPosition, toDests, makeMove, turnColorFromFen } from '../lib/chessopsUtils';

const DBG = process.env.NODE_ENV === 'development';
const PROMOTION_CHOICES = ['queen', 'rook', 'bishop', 'knight'];
const PROMOTION_ORDER = ['queen', 'knight', 'rook', 'bishop'];
const FILES = 'abcdefgh';

function getPromotionContext(position, from, dest) {
  if (!position || !from || !dest) return { needed: false, color: 'white' };
  const fromIdx = (from.charCodeAt(1) - 49) * 8 + (from.charCodeAt(0) - 97);
  const piece = position.board?.get?.(fromIdx);
  if (!piece || piece.role !== 'pawn') return { needed: false, color: 'white' };
  const destRank = Number(dest[1]);
  const rawColor = piece.color;
  const color = rawColor === 'black' || rawColor === 'b' ? 'black' : 'white';
  return { needed: destRank === 1 || destRank === 8, color };
}

function squareToBoardCoords(square, orientation) {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  if (file < 0 || !Number.isFinite(rank)) return { x: 0, y: 0 };
  if (orientation === 'black') {
    return { x: 7 - file, y: rank - 1 };
  }
  return { x: file, y: 8 - rank };
}

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
  const lastMoveRef = useRef(lastMove);
  const premoveEnabledRef = useRef(premoveEnabled);
  const premovableCastleRef = useRef(premovableCastle);
  const fenRef = useRef(fen);
  const promotionResolverRef = useRef(null);
  const [ground, setGround] = useState(null);
  const [promotionUI, setPromotionUI] = useState(null);

  const requestPromotion = (payload) =>
    new Promise((resolve) => {
      promotionResolverRef.current = resolve;
      setPromotionUI(payload);
    });

  const resolvePromotion = (piece) => {
    const resolve = promotionResolverRef.current;
    promotionResolverRef.current = null;
    setPromotionUI(null);
    if (resolve) resolve(piece);
  };

  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

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
  useEffect(() => {
    lastMoveRef.current = lastMove;
  }, [lastMove]);

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
          after: async (orig, dest, metadata) => {
            let san;
            let newFen;
            let promotion;
            const previousLastMove = Array.isArray(lastMoveRef.current) ? lastMoveRef.current : undefined;
            try {
              const promoCtx = getPromotionContext(positionRef.current, orig, dest);
              if (promoCtx.needed) {
                if (metadata?.premove) {
                  promotion = 'queen';
                } else {
                  // Keep prior highlight while promotion choice is pending.
                  cg.set({ lastMove: previousLastMove });
                  promotion = await requestPromotion({
                    color: promoCtx.color,
                    dest,
                    orientation: orientationRef.current,
                  });
                }
                if (!promotion) {
                  cg.set({
                    fen: fenRef.current,
                    turnColor: turnColorFromFen(fenRef.current),
                    orientation: orientationRef.current,
                    lastMove: previousLastMove,
                    movable: {
                      color: disabledRef.current ? 'none' : movableColorRef.current,
                      dests: disabledRef.current ? new Map() : toDests(positionRef.current),
                    },
                  });
                  return;
                }
                if (!PROMOTION_CHOICES.includes(promotion)) promotion = 'queen';
              }
              ({ san, newFen } = makeMove(positionRef.current, orig, dest, promotion));
            } catch (e) {
              console.error('[Chessboard] makeMove failed', { orig, dest, fen, err: String(e) });
              return;
            }
            if (DBG && (san === 'O-O' || san === 'O-O-O')) {
              console.log('[Chessboard] castling', { san, orig, dest, before: fen, after: newFen });
            }

            if (onMoveRef.current) {
              onMoveRef.current({
                from: orig,
                to: dest,
                san,
                newFen,
                promotion: promotion || null,
                premove: !!metadata?.premove,
              });
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
    if (promotionResolverRef.current) {
      promotionResolverRef.current('queen');
      promotionResolverRef.current = null;
    }
    setPromotionUI(null);
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

  const promotionButtons = promotionUI
    ? PROMOTION_ORDER.map((piece, idx) => {
        const { x, y } = squareToBoardCoords(promotionUI.dest, promotionUI.orientation);
        const direction = y <= 4 ? 1 : -1;
        const yAt = y + direction * idx;
        const clampedY = Math.max(0, Math.min(7, yAt));
        return {
          key: piece,
          piece,
          style: {
            left: `${x * 12.5}%`,
            top: `${clampedY * 12.5}%`,
          },
        };
      })
    : [];

  return (
    <div className="chessboard-shell">
      <div ref={containerRef} className="chessboard-root" />
      {promotionUI ? (
        <div
          className="chessboard-promotion-overlay"
          role="dialog"
          aria-label="Choose promotion piece"
          onClick={() => resolvePromotion(null)}
        >
          {promotionButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              className="chessboard-promotion-square"
              style={btn.style}
              aria-label={`Promote to ${btn.piece}`}
              onClick={(e) => {
                e.stopPropagation();
                resolvePromotion(btn.piece);
              }}
            >
              <div className="cg-wrap chessboard-promotion-piece-wrap" aria-hidden>
                <piece className={`chessboard-promotion-piece ${promotionUI.color} ${btn.piece}`} />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
