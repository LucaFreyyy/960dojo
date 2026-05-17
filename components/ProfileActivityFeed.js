import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Chessboard from './Chessboard';
import { stashPgnAndOpenAnalysis } from '../lib/analysisSessionImport';
import { orientationForTacticPuzzle } from '../lib/tacticPgnUtils';
import { evalCpWhiteToMoveListPawns, evalSummaryClass, formatEval } from '../lib/evalDisplay';

function formatPlayedAt(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(iso);
  }
}

function orientationForOpening(color) {
  return color === 'black' || color === 'b' ? 'black' : 'white';
}

function openHistoryInAnalysis(pgn, options = {}) {
  if (!pgn || typeof pgn !== 'string' || !pgn.trim()) return;
  const normalized = pgn.includes('\\n') ? pgn.replace(/\\n/g, '\n').replace(/\\r/g, '\r') : pgn;
  stashPgnAndOpenAnalysis(normalized.trim(), options);
}

function resultForViewer(resultCode, viewerColor) {
  if (resultCode === '1/2-1/2') return 'draw';
  if (resultCode === '1-0') return viewerColor === 'white' ? 'win' : 'loss';
  if (resultCode === '0-1') return viewerColor === 'black' ? 'win' : 'loss';
  return 'draw';
}

function formatSignedDelta(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  return `${n > 0 ? '+' : ''}${n}`;
}

function deltaClassName(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return 'profile-activity-feed__delta--neutral';
  return n > 0 ? 'profile-activity-feed__delta--gain' : 'profile-activity-feed__delta--loss';
}

/** Same hand-drawn check / cross as TacticsPuzzleOverlay; static (no animation). */
function TacticOutcomeIcon({ solved }) {
  const roughId = useId().replace(/:/g, '');
  const fid = `pfeed-${roughId}`;
  return (
    <span
      className={`profile-activity-feed__tactic-icon profile-activity-feed__tactic-icon--${solved ? 'success' : 'fail'}`}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={fid} x="-45%" y="-45%" width="190%" height="190%">
            <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="n" seed="11" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.85" />
          </filter>
        </defs>
        <g filter={`url(#${fid})`} className="profile-activity-feed__tactic-scribble">
          {solved ? (
            <path
              d="M 22 52 L 41 71 L 80 29"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="profile-activity-feed__tactic-check"
            />
          ) : (
            <>
              <path
                d="M 30 30 L 70 70"
                fill="none"
                strokeLinecap="round"
                className="profile-activity-feed__tactic-cross profile-activity-feed__tactic-cross--a"
              />
              <path
                d="M 70 30 L 30 70"
                fill="none"
                strokeLinecap="round"
                className="profile-activity-feed__tactic-cross profile-activity-feed__tactic-cross--b"
              />
            </>
          )}
        </g>
      </svg>
    </span>
  );
}

export default function ProfileActivityFeed({ userId, variant, format = null }) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const itemsLenRef = useRef(0);
  const sentinelRef = useRef(null);

  useEffect(() => {
    itemsLenRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchPage = useCallback(
    async (skip, take) => {
      const formatQuery = variant === 'games' && format ? `&format=${encodeURIComponent(format)}` : '';
      const res = await fetch(
        `/api/profile/activity?userId=${encodeURIComponent(userId)}&skip=${skip}&take=${take}&kind=${encodeURIComponent(variant)}${formatQuery}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load');
      return data;
    },
    [userId, variant, format]
  );

  useEffect(() => {
    if (!userId || !variant) return;
    let cancelled = false;
    setItems([]);
    setHasMore(true);
    setTotalCount(null);
    hasMoreRef.current = true;
    loadingRef.current = false;
    itemsLenRef.current = 0;

    (async () => {
      loadingRef.current = true;
      setLoading(true);
      setError('');
      try {
        const data = await fetchPage(0, 5);
        if (cancelled) return;
        setItems(data.items || []);
        setTotalCount(typeof data.totalCount === 'number' ? data.totalCount : null);
        setHasMore(Boolean(data.hasMore));
        hasMoreRef.current = Boolean(data.hasMore);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load activity');
          setItems([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (!cancelled) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, variant, fetchPage]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingRef.current || !hasMoreRef.current) return;
    const skip = itemsLenRef.current;
    if (skip === 0) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await fetchPage(skip, 10);
      setItems((prev) => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      hasMoreRef.current = Boolean(data.hasMore);
    } catch (e) {
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !userId) return;
    const ob = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        loadMore();
      },
      { root: null, rootMargin: '180px', threshold: 0 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [userId, loadMore]);

  useEffect(() => {
    if (!userId || loading || !hasMore || items.length === 0) return;
    const id = requestAnimationFrame(() => {
      if (loadingRef.current || !hasMoreRef.current) return;
      const el = sentinelRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= window.innerHeight + 280) {
        loadMore();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [userId, items.length, loading, hasMore, loadMore]);

  if (!userId || !variant) return null;

  const title = variant === 'tactics' ? 'Recent puzzles' : variant === 'openings' ? 'Recent opening sessions' : 'Recent games';
  const empty = variant === 'tactics' ? 'No puzzles played yet.' : variant === 'openings' ? 'No opening sessions yet.' : 'No games yet.';
  const totalLabel = variant === 'tactics' ? 'Total puzzles' : variant === 'openings' ? 'Total openings' : 'Total games';

  return (
    <div className="profile-activity-feed">
      <h4 className="profile-activity-feed__title">{title}</h4>
      <div className="profile-activity-feed__total">
        {totalLabel}: {totalCount != null ? totalCount : '—'}
      </div>
      {error ? <div className="alert alert--error profile-activity-feed__err">{error}</div> : null}
      {items.length === 0 && !loading && !error ? (
        <p className="profile-activity-feed__empty">{empty}</p>
      ) : (
        <ul className="profile-activity-feed__list">
          {variant === 'tactics'
            ? items.map((row) => {
                const canAnalyze = Boolean(row.analysisPgn);
                const tacticOrientation = orientationForTacticPuzzle({
                  startFen: row.startFen,
                  pgn: row.analysisPgn,
                });
                return (
                  <li key={`tactic-${row.id}`} className="profile-activity-feed__item">
                    <button
                      type="button"
                      className="profile-activity-feed__item-btn"
                      disabled={!canAnalyze}
                      onClick={() =>
                        openHistoryInAnalysis(row.analysisPgn, {
                          browseAtStart: true,
                          orientation: tacticOrientation,
                        })
                      }
                      aria-label={
                        canAnalyze
                          ? `Open puzzle ${row.tacticId} in analysis`
                          : `Puzzle ${row.tacticId} — analysis unavailable`
                      }
                    >
                      <div className="profile-activity-feed__meta">
                        <time className="profile-activity-feed__time">{formatPlayedAt(row.finished)}</time>
                        <div className="profile-activity-feed__lines">
                          <div className="profile-activity-feed__line profile-activity-feed__line--title">
                            Puzzle #{row.tacticId}
                          </div>
                          {row.solved === true || row.solved === false ? (
                            <div className="profile-activity-feed__line profile-activity-feed__line--outcome">
                              <TacticOutcomeIcon solved={row.solved === true} />
                              <span className="profile-activity-feed__outcome-label">
                                {row.solved === true ? 'Solved' : 'Failed'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {row.startFen ? (
                        <div className="training-chessboard profile-activity-feed__chess" aria-hidden>
                          <Chessboard
                            fen={row.startFen}
                            orientation={tacticOrientation}
                            disabled
                            showCoordinates={false}
                          />
                        </div>
                      ) : (
                        <p className="profile-activity-feed__no-fen">Position unavailable</p>
                      )}
                    </button>
                  </li>
                );
              })
            : variant === 'openings'
              ? items.map((row) => {
                const canAnalyze = Boolean(row.analysisPgn);
                const finalEvalPawns = evalCpWhiteToMoveListPawns(row.finalEvalCpWhite);
                const evalClass =
                  finalEvalPawns != null
                    ? evalSummaryClass(finalEvalPawns, orientationForOpening(row.color))
                    : 'eval-summary--muted';
                const evalText = finalEvalPawns != null ? formatEval(finalEvalPawns) : '';
                return (
                  <li key={`opening-${row.id}`} className="profile-activity-feed__item">
                    <button
                      type="button"
                      className="profile-activity-feed__item-btn"
                      disabled={!canAnalyze}
                      onClick={() =>
                        openHistoryInAnalysis(row.analysisPgn, {
                          orientation: orientationForOpening(row.color),
                        })
                      }
                      aria-label={
                        canAnalyze
                          ? `Open opening session position ${row.openingNr} in analysis`
                          : `Opening position ${row.openingNr} — analysis unavailable`
                      }
                    >
                      <div className="profile-activity-feed__meta">
                        <time className="profile-activity-feed__time">{formatPlayedAt(row.finished)}</time>
                        <div className="profile-activity-feed__lines">
                          <div className="profile-activity-feed__line profile-activity-feed__line--title">Opening</div>
                          <div className="profile-activity-feed__line profile-activity-feed__line--title">
                            Position #{row.openingNr}
                          </div>
                          <div className="profile-activity-feed__line profile-activity-feed__line--eval">
                            <span className="profile-activity-feed__eval-caption">Final eval</span>
                            <span className={`profile-activity-feed__eval-value move-list__eval-strong ${evalClass}`}>
                              {evalText || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="profile-activity-feed__boards profile-activity-feed__boards--cg">
                        <div className="profile-activity-feed__board-wrap">
                          {row.startFen ? (
                            <div className="training-chessboard profile-activity-feed__chess" aria-hidden>
                              <Chessboard
                                fen={row.startFen}
                                orientation={orientationForOpening(row.color)}
                                disabled
                                showCoordinates={false}
                              />
                            </div>
                          ) : (
                            <p className="profile-activity-feed__no-fen">—</p>
                          )}
                        </div>
                        <span className="profile-activity-feed__boards-arrow" aria-hidden>
                          <svg
                            className="profile-activity-feed__boards-arrow-svg"
                            viewBox="0 0 40 16"
                            width="40"
                            height="150"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 8h28M26 3l7 5-7 5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <div className="profile-activity-feed__board-wrap">
                          {row.lastFen || row.startFen ? (
                            <div className="training-chessboard profile-activity-feed__chess" aria-hidden>
                              <Chessboard
                                fen={row.lastFen || row.startFen}
                                orientation={orientationForOpening(row.color)}
                                disabled
                                showCoordinates={false}
                              />
                            </div>
                          ) : (
                            <p className="profile-activity-feed__no-fen">—</p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
              : items.map((row) => {
                  const canAnalyze = Boolean(row.analysisPgn);
                  const viewerColor = row.viewerColor === 'black' ? 'black' : 'white';
                  const outcome = resultForViewer(row.result, viewerColor);
                  const outcomeLabel = outcome === 'win' ? 'Win' : outcome === 'loss' ? 'Loss' : 'Draw';
                  const topPlayer = {
                    id: row.blackId,
                    name: row.blackName || 'Black',
                    ratingBefore: row.blackRatingBefore,
                    delta: row.blackDelta,
                  };
                  const bottomPlayer = {
                    id: row.whiteId,
                    name: row.whiteName || 'White',
                    ratingBefore: row.whiteRatingBefore,
                    delta: row.whiteDelta,
                  };
                  return (
                    <li key={`game-${row.id}`} className="profile-activity-feed__item">
                      <button
                        type="button"
                        className="profile-activity-feed__item-btn"
                        disabled={!canAnalyze}
                        onClick={() =>
                          openHistoryInAnalysis(row.analysisPgn, {
                            orientation: viewerColor,
                            analysisPlayers: {
                              white: {
                                name: row.whiteName || 'White',
                                userId: row.whiteId || null,
                                atTimeRating: row.whiteRatingBefore ?? null,
                                currentRating: row.whiteRatingAfter ?? null,
                              },
                              black: {
                                name: row.blackName || 'Black',
                                userId: row.blackId || null,
                                atTimeRating: row.blackRatingBefore ?? null,
                                currentRating: row.blackRatingAfter ?? null,
                              },
                            },
                          })
                        }
                        aria-label={
                          canAnalyze
                            ? `Open game vs ${row.opponentName || row.opponentId || 'opponent'} in analysis`
                            : 'Game analysis unavailable'
                        }
                      >
                        <div className="profile-activity-feed__meta">
                          <time className="profile-activity-feed__time">{formatPlayedAt(row.finished)}</time>
                          <div className="profile-activity-feed__lines">
                            <div className="profile-activity-feed__line profile-activity-feed__line--title">
                              {row.opponentName || row.opponentId || 'Unknown'}
                            </div>
                            <div className={`profile-activity-feed__line profile-activity-feed__result profile-activity-feed__result--${outcome}`}>
                              {outcomeLabel}
                            </div>
                            <div className="profile-activity-feed__line profile-activity-feed__line--rating">
                              <span
                                className={`profile-activity-feed__rating-name ${
                                  topPlayer.id === userId ? 'profile-activity-feed__rating-name--profile-user' : ''
                                }`.trim()}
                              >
                                {topPlayer.name}
                              </span>
                              <span className="profile-activity-feed__rating-values">
                                {topPlayer.ratingBefore ?? '—'} /
                                {' '}
                                <span className={`profile-activity-feed__delta ${deltaClassName(topPlayer.delta)}`}>
                                  {formatSignedDelta(topPlayer.delta)}
                                </span>
                              </span>
                            </div>
                            <div className="profile-activity-feed__line profile-activity-feed__line--rating">
                              <span
                                className={`profile-activity-feed__rating-name ${
                                  bottomPlayer.id === userId ? 'profile-activity-feed__rating-name--profile-user' : ''
                                }`.trim()}
                              >
                                {bottomPlayer.name}
                              </span>
                              <span className="profile-activity-feed__rating-values">
                                {bottomPlayer.ratingBefore ?? '—'} /
                                {' '}
                                <span className={`profile-activity-feed__delta ${deltaClassName(bottomPlayer.delta)}`}>
                                  {formatSignedDelta(bottomPlayer.delta)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="profile-activity-feed__board-wrap">
                          {row.lastFen ? (
                            <div className="training-chessboard profile-activity-feed__chess" aria-hidden>
                              <Chessboard
                                fen={row.lastFen}
                                orientation={viewerColor}
                                disabled
                                showCoordinates={false}
                              />
                            </div>
                          ) : (
                            <p className="profile-activity-feed__no-fen">—</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
        </ul>
      )}
      {loading ? <p className="profile-activity-feed__loading">Loading…</p> : null}
      <div ref={sentinelRef} className="profile-activity-feed__sentinel" aria-hidden />
    </div>
  );
}
