import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import Chessboard from '../components/Chessboard';
import MoveList from '../components/MoveList';
import RatingDisplay from '../components/RatingDisplay';
import SectionTitle from '../components/SectionTitle';
import { usePlayUi } from '../lib/PlayUiContext';
import { useSupabaseSession } from '../lib/SessionContext';
import { stashPgnAndOpenAnalysis } from '../lib/analysisSessionImport';
import { authedJsonFetch, getAccessToken } from '../lib/playClient';
import { formatClockMs, getQueueLabel } from '../lib/playConstants';
import { Chess } from '../lib/chessCompat';
import { applyPlayMoveOrThrow } from '../lib/playMoveResolution';
import { buildArchivePgn } from '../lib/playPgn';
import { useMoveListWheelNavigation } from '../lib/useMoveListWheelNavigation';

function gameColorForViewer(game, sessionUserId) {
  if (!game || !sessionUserId) return null;
  if (game.whiteId === sessionUserId) return 'white';
  if (game.blackId === sessionUserId) return 'black';
  return null;
}

function replayGame(game) {
  const g = new Chess(game.initialFen);
  for (const move of game.moves || []) {
    const r = g.moveFromUci(move.uci);
    if (!r) throw new Error(`replayGame failed at uci=${move.uci}`);
  }
  return g;
}

function hydrateGame(game) {
  if (!game) return null;
  const g = replayGame(game);
  const pgn = buildArchivePgn(game, {
    Event: '960 Dojo Live Game',
    Result: game.resultCode || '*',
    FEN: game.initialFen,
    Variant: 'Chess960',
    SetUp: '1',
  });
  return {
    ...game,
    currentFen: g.fen(),
    pgn,
  };
}

function deriveLiveClock(game, nowMs) {
  const clock = game?.displayClock;
  if (!clock) return null;
  if (game?.status !== 'active') return clock;
  const runningSinceMs = Date.parse(clock.runningSince || game.updatedAt || game.createdAt || new Date().toISOString());
  const elapsed = Math.max(0, nowMs - (Number.isFinite(runningSinceMs) ? runningSinceMs : nowMs));
  return {
    ...clock,
    whiteMs: clock.activeColor === 'white' ? Math.max(0, clock.whiteMs - elapsed) : clock.whiteMs,
    blackMs: clock.activeColor === 'black' ? Math.max(0, clock.blackMs - elapsed) : clock.blackMs,
  };
}

/** Same move application as the server (chessops only). */
function applyOptimisticMoveWithResult(game, { uci, applied }, color) {
  const now = Date.now();
  const liveClock = deriveLiveClock(game, now);
  const incrementMs = Number(game?.timeControl?.incrementMs) || 0;
  const nextClock =
    liveClock && game?.status === 'active'
      ? {
          ...liveClock,
          whiteMs: color === 'white' ? liveClock.whiteMs + incrementMs : liveClock.whiteMs,
          blackMs: color === 'black' ? liveClock.blackMs + incrementMs : liveClock.blackMs,
          activeColor: color === 'white' ? 'black' : 'white',
          runningSince: new Date(now).toISOString(),
        }
      : {
          ...(game.displayClock || {}),
          activeColor: color === 'white' ? 'black' : 'white',
        };
  return hydrateGame({
    ...game,
    moves: [...(game.moves || []), { uci, san: applied.san, color, at: new Date().toISOString() }],
    lastMoveSquares: [applied.from, applied.to],
    drawOffer: null,
    displayClock: nextClock,
  });
}

function buildFenTrailFromGame(game) {
  if (!game?.initialFen) return [];
  const g = new Chess(game.initialFen);
  const trail = [g.fen()];
  for (const move of game.moves || []) {
    const next = g.moveFromUci(move.uci);
    if (!next) break;
    trail.push(g.fen());
  }
  return trail;
}

function PlayerPanel({ name, rating, delta, clockText, active, top = false, profileUserId = null }) {
  return (
    <div className={`play-player-card ${active ? 'play-player-card--active' : ''} ${top ? 'play-player-card--top' : ''}`.trim()}>
      <RatingDisplay
        className="rating-display--panel"
        label={name}
        rating={rating}
        delta={delta}
        profileUserId={profileUserId}
      />
      <div className="play-player-timer">{clockText}</div>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const session = useSupabaseSession();
  const { status, joinQueue, refreshStatus } = usePlayUi();
  const [viewerId, setViewerId] = useState(null);
  const [game, setGame] = useState(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [info, setInfo] = useState('');
  const [rematchPending, setRematchPending] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());
  const [selection, setSelection] = useState({ index: -1, variationPath: [] });
  const [centerNotice, setCenterNotice] = useState('');
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState(0);
  const [optimisticQueueTime, setOptimisticQueueTime] = useState(null);
  const attemptedJoinRef = useRef('');
  const streamKeyRef = useRef(0);
  const tokenRef = useRef('');
  const lastMoveCountRef = useRef(-1);
  const lastAbortedGameIdRef = useRef('');
  const { moveListNavRef, onWheelNavigate } = useMoveListWheelNavigation();

  const requestedTime = typeof router.query.time === 'string' ? router.query.time : null;
  const requestedGameId = typeof router.query.game === 'string' ? router.query.game : null;

  useEffect(() => {
    if (!session?.user?.email) {
      setViewerId(null);
      return;
    }
    crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(session.user.email))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        setViewerId(hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''));
      })
      .catch(() => setViewerId(null));
  }, [session]);

  useEffect(() => {
    if (!session) {
      tokenRef.current = '';
      return;
    }
    getAccessToken().then((token) => {
      tokenRef.current = token || '';
    });
  }, [session]);

  const viewerColor = useMemo(() => gameColorForViewer(game, viewerId), [game, viewerId]);

  const fetchGame = useCallback(
    async (gameId) => {
      setLoadingGame(true);
      try {
        const json = await authedJsonFetch(`/api/play/game/${encodeURIComponent(gameId)}`);
        if (Number.isFinite(json?.game?.serverNowMs)) {
          setServerClockOffsetMs(json.game.serverNowMs - Date.now());
        }
        setGame(hydrateGame(json.game));
        setInfo('');
      } catch (err) {
        setInfo(err.message || 'Could not load game.');
      } finally {
        setLoadingGame(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!requestedGameId || !session) return;
    fetchGame(requestedGameId);
  }, [requestedGameId, session, fetchGame]);

  const sendReadySignal = useCallback(
    async (gameId) => {
      if (!gameId) return;
      try {
        const result = await authedJsonFetch('/api/play/ready', {
          method: 'POST',
          body: JSON.stringify({ gameId }),
        });
        if (result?.game) {
          if (Number.isFinite(result.game.serverNowMs)) {
            setServerClockOffsetMs(result.game.serverNowMs - Date.now());
          }
          setGame(hydrateGame(result.game));
        }
      } catch {}
    },
    []
  );

  useEffect(() => {
    if (!session || requestedGameId || !requestedTime) return;
    if (status?.queue?.time === requestedTime) return;
    const joinKey = `${requestedTime}:${status?.queue?.time || ''}:${status?.activeGame?.id || ''}`;
    if (attemptedJoinRef.current === joinKey) return;
    attemptedJoinRef.current = joinKey;
    setOptimisticQueueTime(requestedTime);
    joinQueue(requestedTime)
      .then((result) => {
        setInfo('');
        if (result?.game?.id) {
          setOptimisticQueueTime(null);
        }
      })
      .catch((err) => {
        setOptimisticQueueTime(null);
        setInfo(err.message || 'Could not join queue.');
      });
  }, [session, requestedTime, requestedGameId, status, joinQueue]);

  useEffect(() => {
    if (status?.queue?.time) {
      setOptimisticQueueTime(null);
      return;
    }
    if (status?.activeGame?.id) {
      setOptimisticQueueTime(null);
    }
  }, [status?.queue?.time, status?.activeGame?.id]);

  useEffect(() => {
    if (!session || !requestedGameId) return undefined;
    let es = null;
    let reconnectTimer = null;
    let closed = false;

    const openStream = async () => {
      const token = await getAccessToken();
      if (!token || closed) return;
      es = new EventSource(`/api/play/stream/${encodeURIComponent(requestedGameId)}?token=${encodeURIComponent(token)}&v=${streamKeyRef.current}`);
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.game) {
            if (Number.isFinite(payload.game.serverNowMs)) {
              setServerClockOffsetMs(payload.game.serverNowMs - Date.now());
            }
            setGame(hydrateGame(payload.game));
            refreshStatus();
          }
        } catch {}
      };
      sendReadySignal(requestedGameId);
      es.onerror = () => {
        try {
          es?.close();
        } catch {}
        if (!closed) {
          reconnectTimer = window.setTimeout(() => {
            streamKeyRef.current += 1;
            openStream();
          }, 3000);
        }
      };
    };

    openStream();
    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      try {
        es?.close();
      } catch {}
    };
  }, [session, requestedGameId, refreshStatus, sendReadySignal]);

  useEffect(() => {
    if (status?.activeGame?.id && requestedGameId && status.activeGame.id !== requestedGameId) {
      router.replace(`/play?game=${encodeURIComponent(status.activeGame.id)}`);
    }
  }, [status?.activeGame?.id, requestedGameId, router, status]);

  useEffect(() => {
    if (game?.status !== 'active') return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [game?.status]);

  useEffect(() => {
    if (!game?.id) return undefined;
    return () => {
      if (!rematchPending) return;
      fetch('/api/play/action', {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify({ action: 'cancel_rematch', gameId: game.id }),
      }).catch(() => {});
    };
  }, [game?.id, rematchPending]);

  const liveClock = deriveLiveClock(game, clockNow + serverClockOffsetMs);
  const whiteClockText = formatClockMs(liveClock?.whiteMs ?? game?.timeControl?.initialMs ?? 0);
  const blackClockText = formatClockMs(liveClock?.blackMs ?? game?.timeControl?.initialMs ?? 0);
  const latestMoveIndex = (game?.moves?.length || 0) - 1;
  const isBrowsingLatest = (selection?.index ?? -1) >= latestMoveIndex;
  const movableColor = game?.status === 'active' && viewerColor && isBrowsingLatest ? viewerColor : 'none';
  const showWhiteOnTop = viewerColor === 'black';

  const whitePanel = game ? (
    <PlayerPanel
      name={game.whiteName}
      rating={game.ratingDelta?.whiteAfter ?? game.whiteRating}
      delta={game.ratingDelta?.white ?? null}
      profileUserId={game.whiteId}
      clockText={whiteClockText}
      active={liveClock?.activeColor === 'white' && game.status === 'active'}
    />
  ) : null;

  const blackPanel = game ? (
    <PlayerPanel
      name={game.blackName}
      rating={game.ratingDelta?.blackAfter ?? game.blackRating}
      delta={game.ratingDelta?.black ?? null}
      profileUserId={game.blackId}
      clockText={blackClockText}
      active={liveClock?.activeColor === 'black' && game.status === 'active'}
      top
    />
  ) : null;

  const sendGameAction = useCallback(
    async (action, extra = {}) => {
      if (!game?.id) return null;
      const result = await authedJsonFetch('/api/play/action', {
        method: 'POST',
        body: JSON.stringify({ action, gameId: game.id, ...extra }),
      });
      if (result?.game) {
        if (Number.isFinite(result.game.serverNowMs)) {
          setServerClockOffsetMs(result.game.serverNowMs - Date.now());
        }
        setGame(hydrateGame(result.game));
      }
      if (action === 'request_rematch') setRematchPending(true);
      if (action === 'cancel_rematch' || action === 'play_again') setRematchPending(false);
      await refreshStatus();
      return result;
    },
    [game?.id, refreshStatus]
  );

  const handleMove = useCallback(
    (move) => {
      if (!game || game.status !== 'active' || !viewerColor) return false;
      let playResult;
      try {
        playResult = applyPlayMoveOrThrow(game, {
          from: move.from,
          to: move.to,
          promotion: move.promotion ?? null,
        });
      } catch {
        return false;
      }

      const gid = game.id;
      setGame((current) => applyOptimisticMoveWithResult(current, playResult, viewerColor));

      void (async () => {
        try {
          await authedJsonFetch('/api/play/move', {
            method: 'POST',
            body: JSON.stringify({
              gameId: gid,
              from: move.from,
              to: move.to,
              san: move.san,
              promotion: move.promotion ?? null,
              clientFen: move.newFen,
            }),
          });
        } catch {
          await fetchGame(gid);
        }
      })();

      return true;
    },
    [game, viewerColor, fetchGame]
  );

  const drawOfferFromOpponent =
    game?.drawOffer && viewerColor && game.drawOffer.fromColor !== viewerColor ? game.drawOffer : null;
  const ownDrawOffer =
    Boolean(game?.drawOffer && viewerColor && game.drawOffer.fromColor === viewerColor);
  const fenTrail = useMemo(() => buildFenTrailFromGame(game), [game]);
  const browsedFen = useMemo(() => {
    if (!game) return null;
    if (!fenTrail.length) return game.currentFen || game.initialFen;
    const idx = Number.isInteger(selection.index) ? selection.index : -1;
    const safe = Math.max(-1, Math.min(fenTrail.length - 2, idx));
    return fenTrail[safe + 1] || game.currentFen || game.initialFen;
  }, [game, fenTrail, selection.index]);

  useEffect(() => {
    const moveCount = game?.moves?.length ?? 0;
    if (!game) {
      lastMoveCountRef.current = -1;
      setSelection({ index: -1, variationPath: [] });
      return;
    }
    if (lastMoveCountRef.current === -1) {
      lastMoveCountRef.current = moveCount;
      setSelection({ index: Math.max(-1, moveCount - 1), variationPath: [] });
      return;
    }
    if (moveCount !== lastMoveCountRef.current) {
      lastMoveCountRef.current = moveCount;
      setSelection({ index: Math.max(-1, moveCount - 1), variationPath: [] });
    }
  }, [game, game?.id, game?.moves?.length]);

  useEffect(() => {
    if (!game || game.status !== 'aborted') return;
    if (lastAbortedGameIdRef.current === game.id) return;
    lastAbortedGameIdRef.current = game.id;
    setCenterNotice(game.resultText || 'Game aborted.');
    const timer = window.setTimeout(() => setCenterNotice(''), 3800);
    return () => window.clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    if (!game) {
      setRematchPending(false);
      return;
    }
    if (game.status === 'active' || game.status === 'awaiting_handshake') {
      setRematchPending(false);
      return;
    }
    if (status?.activeGame?.id && status.activeGame.id !== game.id) {
      setRematchPending(false);
    }
  }, [game, status?.activeGame?.id]);

  const handleMoveListBrowse = useCallback((index, variationPath) => {
    setSelection({
      index: Number.isInteger(index) ? index : -1,
      variationPath: Array.isArray(variationPath) ? variationPath : [],
    });
  }, []);
  const effectiveQueueTime = status?.queue?.time || optimisticQueueTime;

  return (
    <>
      <Head>
        <title>Play - 960 Dojo</title>
      </Head>
      <main className="page-shell play-page">
        <SectionTitle
          titleText={
            <span className="play-title-main">
              Play
              {game?.time ? <span className="play-title-format-inline">{getQueueLabel(game.time)}</span> : null}
            </span>
          }
        />
        {!session ? (
          <div className="text-muted">Please sign in to play live games.</div>
        ) : requestedGameId ? (
          !game || loadingGame ? (
            <div className="text-muted">{loadingGame ? 'Loading game…' : info || 'Loading game…'}</div>
          ) : (
            <div className="play-layout">
              <div className="play-board-column">
                {showWhiteOnTop ? whitePanel : blackPanel}
                <Chessboard
                  fen={browsedFen || game.currentFen || game.initialFen}
                  orientation={viewerColor || 'white'}
                  onMove={handleMove}
                  disabled={game.status !== 'active'}
                  movableColor={movableColor}
                  premoveEnabled
                  cancelQueuedPremove={!isBrowsingLatest}
                  lastMove={Array.isArray(game.lastMoveSquares) ? game.lastMoveSquares : undefined}
                  onWheelNavigate={onWheelNavigate}
                />
                {showWhiteOnTop ? blackPanel : whitePanel}
                {game.status !== 'active' ? (
                  <div className="play-inline-notice play-inline-notice--result">
                    {game.resultText}
                  </div>
                ) : null}
                {info ? <div className="text-muted">{info}</div> : null}
              </div>
              <aside className="play-side-column">
                <div className="play-side-stack">
                  <div className="play-draw-offer-slot">
                    {drawOfferFromOpponent && game.status === 'active' ? (
                      <div className="play-draw-offer-alert" role="status" aria-live="polite">
                        <div className="play-draw-offer-alert__text">Draw offered</div>
                        <div className="play-draw-offer-alert__actions">
                          <Button className="btn--sm" variant="success" onClick={() => sendGameAction('accept_draw')}>
                            Accept
                          </Button>
                          <Button className="btn--sm" variant="danger" onClick={() => sendGameAction('decline_draw')}>
                            Decline
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <MoveList
                    ref={moveListNavRef}
                    className="play-move-list"
                    pgn={game.pgn || ''}
                    evalData={null}
                    userColor={viewerColor || 'white'}
                    loading={false}
                    selectedPosition={selection}
                    onBrowsePositionChanged={handleMoveListBrowse}
                    resetSelectionOnPgnChange={false}
                  />
                </div>
                <div className="play-actions">
                  {game.status === 'active' ? (
                    <>
                      <Button variant="danger" onClick={() => sendGameAction('resign')}>
                        Resign
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => sendGameAction(ownDrawOffer ? 'cancel_draw_offer' : 'offer_draw')}
                      >
                        {ownDrawOffer ? 'Cancel Draw Offer' : 'Offer Draw'}
                      </Button>
                    </>
                  ) : null}
                  {game.status === 'active' ? null : game.status === 'awaiting_handshake' ? (
                    <div className="text-muted">Waiting for both players to connect…</div>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => stashPgnAndOpenAnalysis(game.pgn, { orientation: viewerColor || 'white' })}
                      >
                        Open Analysis
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          if (status?.activeGame?.id && status.activeGame.id !== game.id) {
                            setRematchPending(false);
                            return;
                          }
                          if (rematchPending) {
                            await sendGameAction('cancel_rematch');
                          } else {
                            await sendGameAction('request_rematch');
                          }
                        }}
                        disabled={Boolean(status?.activeGame?.id && status.activeGame.id !== game.id)}
                      >
                        {rematchPending ? 'Cancel Rematch' : 'Rematch'}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          await sendGameAction('cancel_rematch');
                          const result = await joinQueue(game.time);
                          if (result?.game?.id) {
                            router.replace(`/play?game=${encodeURIComponent(result.game.id)}`);
                          } else {
                            setInfo(`Joined ${getQueueLabel(game.time)} queue.`);
                          }
                        }}
                      >
                        Play Again
                      </Button>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )
        ) : (
          <>
            <div className="play-inline-notice">
              {effectiveQueueTime
                ? `Searching for game: ${getQueueLabel(effectiveQueueTime)}`
                : 'Custom time controls are not yet available. Join another queue from the home screen.'}
            </div>
            {info ? <div className="text-muted">{info}</div> : null}
          </>
        )}
        {centerNotice ? <div className="play-center-notice">{centerNotice}</div> : null}
      </main>
    </>
  );
}
