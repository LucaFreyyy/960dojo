import { useEffect, useMemo, useRef, useState } from 'react';
import { parseSquare } from 'chessops/util';
import { Chessground } from 'chessground';
import { createPosition, toDests, makeMove, turnColorFromFen } from '../lib/chessopsUtils';
import { playChessMove, playPieceTouch } from '../lib/soundEffects';
import { boardThemeAsset, normalizeBoardTheme, normalizePieceSet } from '../lib/boardVisuals';
import { useBoardVisuals } from '../lib/BoardVisualsContext';

const PROMOTION_CHOICES = ['queen', 'rook', 'bishop', 'knight'];
const PROMOTION_ORDER = ['queen', 'knight', 'rook', 'bishop'];
const FILES = 'abcdefgh';
const EMPTY_AUTO_SHAPES = Object.freeze([]);
const DEFAULT_USER_DRAWABLE_BRUSHES = {
  green: { key: 'green', color: '#2e8bff', opacity: 0.95, lineWidth: 10 },
  red: { key: 'red', color: '#cb5cff', opacity: 0.95, lineWidth: 10 },
  blue: { key: 'blue', color: '#2e8bff', opacity: 0.95, lineWidth: 10 },
  yellow: { key: 'yellow', color: '#cb5cff', opacity: 0.95, lineWidth: 10 },
};

function normalizeQueuedPremove(value) {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 2) {
    const [orig, dest] = value;
    if (typeof orig === 'string' && typeof dest === 'string') return { orig, dest };
  }
  if (typeof value === 'object' && typeof value.orig === 'string' && typeof value.dest === 'string') {
    return { orig: value.orig, dest: value.dest };
  }
  return null;
}

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
  /** Engine / analysis arrows: `{ orig, dest, brush }[]` — uses chessground `drawable.autoShapes` */
  autoShapes = EMPTY_AUTO_SHAPES,
  /** User drawn shapes (arrows/circles), persisted by the caller. */
  userShapes = EMPTY_AUTO_SHAPES,
  /** Extra chessground brush defs merged into `drawable.brushes` (e.g. eval-colored arrows). */
  extraDrawableBrushes = null,
  /** Optional user drawing brush palette override. */
  userDrawableBrushes = null,
  /** Called whenever user drawable shapes change. */
  onUserShapesChange = null,
  /** Rank/file labels (chessground `coordinates`). Default true for training boards. */
  showCoordinates = true,
  /** Wheel over the board: -1 = previous move, +1 = next (non-passive listener; used with MoveList ref). */
  onWheelNavigate = null,
  /** When toggled true, any queued premove is cancelled. */
  cancelQueuedPremove = false,
  /** Visual theme keys from settings. */
  pieceSet,
  boardTheme,
}) {
  const globalVisuals = useBoardVisuals();
  const containerRef = useRef(null);
  const shellRef = useRef(null);
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
  const queuedPremoveRef = useRef(null);
  const pieceSelectHandlerRef = useRef(() => {});
  pieceSelectHandlerRef.current = (key) => {
    if (!key || disabledRef.current) return;
    const pos = positionRef.current;
    if (!pos) return;
    const sq = parseSquare(key);
    if (sq === undefined) return;
    if (pos.board.get(sq)) playPieceTouch();
  };
  /** Chessground 9+ calls `state.events.select` when a square is chosen (tap or drag start), not `selectable.events.set`. */
  const onChessSelect = useMemo(() => (key) => pieceSelectHandlerRef.current(key), []);
  const [ground, setGround] = useState(null);
  const [promotionUI, setPromotionUI] = useState(null);
  const [pieceAssetExt, setPieceAssetExt] = useState('svg');
  const [resolvedPieceTheme, setResolvedPieceTheme] = useState('cburnett');
  const [resolvedBoardTheme, setResolvedBoardTheme] = useState('brown.png');
  const pieceTheme = normalizePieceSet(pieceSet || globalVisuals?.pieceSet || 'cburnett');
  const boardThemeKey = normalizeBoardTheme(boardTheme || globalVisuals?.boardTheme || 'brown');
  const boardImage = boardThemeAsset(resolvedBoardTheme || boardThemeKey);

  const chessEvents = useMemo(() => ({ select: onChessSelect }), [onChessSelect]);

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

  const onWheelNavigateRef = useRef(onWheelNavigate);
  onWheelNavigateRef.current = onWheelNavigate;

  useEffect(() => {
    if (!fen) return undefined;
    const el = shellRef.current;
    if (!el) return undefined;
    const wheelOpts = { passive: false, capture: true };
    const onWheel = (e) => {
      const fn = onWheelNavigateRef.current;
      if (typeof fn !== 'function') return;
      if (Math.abs(e.deltaY) < 6 && Math.abs(e.deltaX) < 6) return;
      e.preventDefault();
      e.stopPropagation();
      fn(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, wheelOpts);
    return () => el.removeEventListener('wheel', onWheel, wheelOpts);
  }, [fen]);

  // Initialize once when a valid fen exists.
  useEffect(() => {
    if (ground || !fen || !containerRef.current) return;
    positionRef.current = createPosition(fen);
    if (!positionRef.current) return;

    const cg = Chessground(containerRef.current, {
      fen: fen,
      orientation: orientation,
      coordinates: showCoordinates,
      autoCastle: false,
      turnColor: turnColorFromFen(fen),
      events: chessEvents,
      selectable: { enabled: !disabled },
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
        events: {
          set: (orig, dest, metadata) => {
            queuedPremoveRef.current = { orig, dest, metadata };
          },
          unset: () => {},
        },
      },
      drawable: {
        autoShapes: Array.isArray(autoShapes) ? autoShapes : [],
        // Never pass a frozen/shared array into chessground drawable state.
        shapes: Array.isArray(userShapes) ? [...userShapes] : [],
        onChange: typeof onUserShapesChange === 'function' ? onUserShapesChange : undefined,
        brushes: {
          ...DEFAULT_USER_DRAWABLE_BRUSHES,
          ...(userDrawableBrushes || {}),
          ...(extraDrawableBrushes || {}),
        },
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
            const origSq = parseSquare(orig);
            const movingPiece = origSq === undefined ? null : positionRef.current?.board?.get?.(origSq) || null;
            const movingColor = movingPiece?.color === 'black' || movingPiece?.color === 'b' ? 'black' : 'white';
            const turnColor = positionRef.current?.turn === 'black' || positionRef.current?.turn === 'b' ? 'black' : 'white';
            // Any out-of-turn attempt should be treated as queue-only and left to chessground premove handling.
            // Depending on chessground internals/version, metadata.premove may not always be set on queue.
            if (movingPiece && movingColor !== turnColor) {
              return;
            }
            try {
              const promoCtx = getPromotionContext(positionRef.current, orig, dest);
              if (promoCtx.needed) {
                if (metadata?.premove) {
                  promotion = 'queen';
                } else {
                  // Keep prior highlight while promotion choice is pending.
                  cg.set({
                    lastMove: previousLastMove,
                    events: chessEvents,
                    selectable: { enabled: !disabledRef.current },
                  });
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
                    events: chessEvents,
                    selectable: { enabled: !disabledRef.current },
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
            const inCheck = positionRef.current.isCheck();
            playChessMove({ inCheck });

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
              events: chessEvents,
              selectable: { enabled: !disabledRef.current },
              premovable: {
                enabled: premoveEnabledRef.current && !disabledRef.current,
                showDests: true,
                castle: premovableCastleRef.current,
                events: {
                  set: (orig, dest, metadata) => {
                    queuedPremoveRef.current = { orig, dest, metadata };
                  },
                  unset: () => {},
                },
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
  }, [
    fen,
    ground,
    orientation,
    disabled,
    movableColor,
    premoveEnabled,
    premovableCastle,
    chessEvents,
    showCoordinates,
    autoShapes,
    userShapes,
    extraDrawableBrushes,
    userDrawableBrushes,
    onUserShapesChange,
  ]);

  useEffect(() => {
    if (!ground) return;
    ground.set({ coordinates: showCoordinates });
  }, [ground, showCoordinates]);

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

    const queuedFromState = normalizeQueuedPremove(ground?.state?.premovable?.current);
    if (queuedFromState) queuedPremoveRef.current = queuedFromState;

    positionRef.current = newPosition;

    ground.set({
      fen: fen,
      turnColor: turnColorFromFen(fen),
      lastMove: Array.isArray(lastMove) ? lastMove : undefined,
      events: chessEvents,
      selectable: { enabled: !disabled },
      drawable: {
        autoShapes: Array.isArray(autoShapes) ? autoShapes : [],
        // Never pass a frozen/shared array into chessground drawable state.
        shapes: Array.isArray(userShapes) ? [...userShapes] : [],
        onChange: typeof onUserShapesChange === 'function' ? onUserShapesChange : undefined,
        brushes: {
          ...DEFAULT_USER_DRAWABLE_BRUSHES,
          ...(userDrawableBrushes || {}),
          ...(extraDrawableBrushes || {}),
        },
      },
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
        events: {
          set: (orig, dest, metadata) => {
            queuedPremoveRef.current = { orig, dest, metadata };
          },
          unset: () => {},
        },
      },
      movable: {
        color: disabled ? 'none' : movableColor,
        dests: disabled ? new Map() : toDests(positionRef.current),
      },
    });
    if (premoveEnabled && !disabled) {
      const played = typeof ground.playPremove === 'function' ? ground.playPremove() : false;
      // Fallback path: if chessground cleared queued premove on sync without executing it,
      // execute it manually when it's now our turn.
      if (
        !played &&
        queuedPremoveRef.current &&
        (movableColor === 'white' || movableColor === 'black') &&
        turnColorFromFen(fen) === movableColor
      ) {
        try {
          const { orig, dest } = queuedPremoveRef.current;
          const promoCtx = getPromotionContext(positionRef.current, orig, dest);
          const promotion = promoCtx.needed ? 'queen' : null;
          const { san, newFen } = makeMove(positionRef.current, orig, dest, promotion);
          queuedPremoveRef.current = null;
          onMoveRef.current?.({
            from: orig,
            to: dest,
            san,
            newFen,
            promotion: promotion || null,
            premove: true,
          });
          onPositionChangeRef.current?.(newFen);
          ground.set({
            fen: newFen,
            turnColor: turnColorFromFen(newFen),
            orientation: orientationRef.current,
            lastMove: [orig, dest],
            events: chessEvents,
            selectable: { enabled: !disabled },
            movable: {
              color: disabled ? 'none' : movableColor,
              dests: disabled ? new Map() : toDests(positionRef.current),
            },
          });
        } catch (error) {
          queuedPremoveRef.current = null;
        }
      }
    } else {
      ground.cancelPremove();
    }
  }, [
    fen,
    ground,
    disabled,
    lastMove,
    movableColor,
    premoveEnabled,
    premovableCastle,
    autoShapes,
    userShapes,
    extraDrawableBrushes,
    userDrawableBrushes,
    onUserShapesChange,
    chessEvents,
  ]);

  useEffect(() => {
    if (!ground) return;

    orientationRef.current = orientation;
    ground.set({
      orientation: orientationRef.current,
      turnColor: turnColorFromFen(fen),
      lastMove: Array.isArray(lastMove) ? lastMove : undefined,
      events: chessEvents,
      selectable: { enabled: !disabled },
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
  }, [fen, orientation, ground, disabled, movableColor, premoveEnabled, premovableCastle, chessEvents, lastMove]);

  useEffect(() => {
    if (!ground) return;
    ground.set({
      events: chessEvents,
      selectable: { enabled: !disabled },
      lastMove: Array.isArray(lastMove) ? lastMove : undefined,
      premovable: {
        enabled: premoveEnabled && !disabled,
        showDests: true,
        castle: premovableCastle,
      },
    });
  }, [ground, premoveEnabled, premovableCastle, disabled, chessEvents, lastMove]);

  useEffect(() => {
    if (!ground) return;
    if (!cancelQueuedPremove) return;
    try {
      ground.cancelPremove();
    } catch {}
  }, [ground, cancelQueuedPremove]);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === 'undefined') return undefined;
    const candidates = ['svg', 'png', 'webp'];
    const probe = (theme, ext) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `/lichess-assets/piece/${theme}/wP.${ext}`;
      });
    (async () => {
      for (const ext of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await probe(pieceTheme, ext);
        if (ok) {
          if (!cancelled) {
            setResolvedPieceTheme(pieceTheme);
            setPieceAssetExt(ext);
          }
          return;
        }
      }
      for (const ext of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await probe('cburnett', ext);
        if (ok) {
          if (!cancelled) {
            setResolvedPieceTheme('cburnett');
            setPieceAssetExt(ext);
          }
          return;
        }
      }
      if (!cancelled) {
        setResolvedPieceTheme('cburnett');
        setPieceAssetExt('svg');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pieceTheme]);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === 'undefined') return undefined;
    const probeBoard = (theme) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = boardThemeAsset(theme);
      });
    (async () => {
      // eslint-disable-next-line no-await-in-loop
      const preferredOk = await probeBoard(boardThemeKey);
      if (preferredOk) {
        if (!cancelled) setResolvedBoardTheme(boardThemeKey);
        return;
      }
      // eslint-disable-next-line no-await-in-loop
      const fallbackOk = await probeBoard('brown.png');
      if (!cancelled) {
        setResolvedBoardTheme(fallbackOk ? 'brown.png' : boardThemeKey);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardThemeKey]);

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

  const themeStyle = {
    '--board-theme-image': `url("${boardImage}")`,
    '--piece-wp': `url("/lichess-assets/piece/${resolvedPieceTheme}/wP.${pieceAssetExt}")`,
    '--piece-wn': `url("/lichess-assets/piece/${resolvedPieceTheme}/wN.${pieceAssetExt}")`,
    '--piece-wb': `url("/lichess-assets/piece/${resolvedPieceTheme}/wB.${pieceAssetExt}")`,
    '--piece-wr': `url("/lichess-assets/piece/${resolvedPieceTheme}/wR.${pieceAssetExt}")`,
    '--piece-wq': `url("/lichess-assets/piece/${resolvedPieceTheme}/wQ.${pieceAssetExt}")`,
    '--piece-wk': `url("/lichess-assets/piece/${resolvedPieceTheme}/wK.${pieceAssetExt}")`,
    '--piece-bp': `url("/lichess-assets/piece/${resolvedPieceTheme}/bP.${pieceAssetExt}")`,
    '--piece-bn': `url("/lichess-assets/piece/${resolvedPieceTheme}/bN.${pieceAssetExt}")`,
    '--piece-bb': `url("/lichess-assets/piece/${resolvedPieceTheme}/bB.${pieceAssetExt}")`,
    '--piece-br': `url("/lichess-assets/piece/${resolvedPieceTheme}/bR.${pieceAssetExt}")`,
    '--piece-bq': `url("/lichess-assets/piece/${resolvedPieceTheme}/bQ.${pieceAssetExt}")`,
    '--piece-bk': `url("/lichess-assets/piece/${resolvedPieceTheme}/bK.${pieceAssetExt}")`,
  };

  return (
    <div ref={shellRef} className={`chessboard-shell chessboard-theme--${boardThemeKey}`} style={themeStyle}>
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
