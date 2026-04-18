// pages/leaderboard.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { ESTABLISHED_RATING_MIN_ENTRIES } from '../lib/ratingConstants';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import StreakFlameBadge from '../components/streak/StreakFlameBadge';
import { normalizePersistedStreakRow } from '../lib/streakCompute';

function streakScoreVariant(row) {
  const longest = row.longestStreak ?? 0;
  const current = row.currentStreak ?? 0;
  const playedToday = row.playedToday === true;
  if (longest < 1) return 'muted';
  if (current >= longest) return playedToday ? 'full' : 'half';
  return 'muted';
}

export default function LeaderboardPage() {
  const session = useSupabaseSession();
  const todayUtc = new Date().toISOString().slice(0, 10);
  const [viewerUserId, setViewerUserId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('streak');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerSummary, setViewerSummary] = useState(null);

  const categories = [
    { id: 'bullet', label: 'Bullet' },
    { id: 'blitz', label: 'Blitz' },
    { id: 'rapid', label: 'Rapid' },
    { id: 'classical', label: 'Classical' },
    { id: 'tactics', label: 'Tactics' },
    { id: 'openings', label: 'Openings' },
    { id: 'streak', label: 'Streak' },
  ];
  const playCategories = ['bullet', 'blitz', 'rapid', 'classical'];
  const otherCategories = ['tactics', 'openings', 'streak'];
  const isStreakCategory = activeCategory === 'streak';

  useEffect(() => {
    if (!session?.user?.email) {
      setViewerUserId(null);
      return;
    }
    let cancelled = false;
    hashEmail(session.user.email)
      .then((id) => {
        if (!cancelled) setViewerUserId(id);
      })
      .catch(() => {
        if (!cancelled) setViewerUserId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRatingLeaderboard() {
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('Rating')
        .select('userId, type, value, createdAt')
        .eq('type', activeCategory)
        .order('createdAt', { ascending: false });

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        return;
      }

      const entryCountByUser = {};
      ratingsData?.forEach((row) => {
        entryCountByUser[row.userId] = (entryCountByUser[row.userId] || 0) + 1;
      });

      const userLatestRatings = {};
      ratingsData?.forEach((rating) => {
        if (
          !userLatestRatings[rating.userId] ||
          new Date(rating.createdAt) > new Date(userLatestRatings[rating.userId].createdAt)
        ) {
          userLatestRatings[rating.userId] = rating;
        }
      });

      const userIds = Object.keys(userLatestRatings).filter(
        (uid) => (entryCountByUser[uid] || 0) >= ESTABLISHED_RATING_MIN_ENTRIES
      );
      if (userIds.length === 0) {
        if (!cancelled) {
          setLeaderboardData([]);
          setViewerSummary(viewerUserId ? { kind: 'not_placed', mode: 'rating' } : null);
        }
        return;
      }

      const { data: usersData, error: usersError } = await supabase.from('User').select('id, name').in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      const sortedAll = userIds
        .map((userId) => {
          const user = usersData.find((u) => u.id === userId);
          const rating = userLatestRatings[userId];
          return {
            id: userId,
            name: user?.name || 'Unknown Player',
            rating: rating?.value || 0,
            createdAt: rating?.createdAt,
          };
        })
        .filter((item) => item.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

      const top50 = sortedAll.slice(0, 50);

      let nextViewerSummary = null;
      if (viewerUserId) {
        const me = sortedAll.find((p) => p.id === viewerUserId);
        nextViewerSummary = me
          ? { kind: 'placed', mode: 'rating', rank: me.rank, rating: me.rating }
          : { kind: 'not_placed', mode: 'rating' };
      }

      if (!cancelled) {
        setLeaderboardData(top50);
        setViewerSummary(nextViewerSummary);
      }
    }

    async function fetchStreakLeaderboard() {
      const { data: streakRows, error: streakErr } = await supabase
        .from('Streak')
        .select('userId, currentStreak, longestStreak, lastActivityDate')
        .gt('longestStreak', 0)
        .order('longestStreak', { ascending: false })
        .order('currentStreak', { ascending: false })
        .limit(50);

      if (streakErr) {
        console.error('Error fetching streak leaderboard:', streakErr);
        if (!cancelled) {
          setLeaderboardData([]);
          setViewerSummary(viewerUserId ? { kind: 'not_placed', mode: 'streak' } : null);
        }
        return;
      }

      const rows = streakRows || [];
      if (rows.length === 0) {
        if (!cancelled) {
          setLeaderboardData([]);
          setViewerSummary(viewerUserId ? { kind: 'not_placed', mode: 'streak' } : null);
        }
        return;
      }

      const userIds = rows.map((r) => r.userId);
      const { data: usersData, error: usersError } = await supabase.from('User').select('id, name').in('id', userIds);

      if (usersError) {
        console.error('Error fetching users for streak:', usersError);
        return;
      }

      const top50 = rows.map((row, index) => {
        const user = usersData?.find((u) => u.id === row.userId);
        const normalizedStreak = normalizePersistedStreakRow(row, todayUtc) || row;
        return {
          id: row.userId,
          name: user?.name || 'Unknown Player',
          rank: index + 1,
          longestStreak: normalizedStreak.longestStreak ?? 0,
          currentStreak: normalizedStreak.currentStreak ?? 0,
          playedToday: normalizedStreak.playedToday === true,
        };
      });

      let nextViewerSummary = null;
      if (viewerUserId) {
        const mineRaw = rows.find((r) => r.userId === viewerUserId);
        const mine = normalizePersistedStreakRow(mineRaw, todayUtc);
        if (mine && (mine.longestStreak ?? 0) > 0) {
          const { count, error: cErr } = await supabase
            .from('Streak')
            .select('*', { count: 'exact', head: true })
            .gt('longestStreak', mine.longestStreak);
          if (!cErr) {
            const rank = (count ?? 0) + 1;
            nextViewerSummary = {
              kind: 'placed',
              mode: 'streak',
              rank,
              longestStreak: mine.longestStreak,
              currentStreak: mine.currentStreak,
            };
          } else {
            nextViewerSummary = { kind: 'not_placed', mode: 'streak' };
          }
        } else {
          nextViewerSummary = { kind: 'not_placed', mode: 'streak' };
        }
      }

      if (!cancelled) {
        setLeaderboardData(top50);
        setViewerSummary(nextViewerSummary);
      }
    }

    async function run() {
      try {
        setLoading(true);
        if (isStreakCategory) {
          await fetchStreakLeaderboard();
        } else {
          await fetchRatingLeaderboard();
        }
      } catch (e) {
        console.error('Leaderboard fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isStreakCategory, activeCategory, viewerUserId, todayUtc]);

  function pageTitle() {
    if (isStreakCategory) return 'Daily streak leaderboard';
    const category = categories.find((c) => c.id === activeCategory);
    return category ? `${category.label} leaderboard` : 'Leaderboard';
  }

  return (
    <>
      <Head>
        <title>{pageTitle()} - 960 Dojo</title>
      </Head>
      <main className="leaderboard-page">
        <h1 className="leaderboard-title">Chess 960 Leaderboard</h1>
        <p className="leaderboard-sub">
          {isStreakCategory
            ? 'Top 50 players by all-time daily play streak (tactics + openings + live play, UTC days)'
            : 'Top 50 players by rating category'}
        </p>

        <div className="leaderboard-cats-wrap">
          <div className="leaderboard-cats">
            {playCategories.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`leaderboard-cat-btn ${
                  activeCategory === category.id ? 'leaderboard-cat-btn--active' : ''
                }`.trim()}
              >
                {category.label}
              </button>
              );
            })}
          </div>
          <div className="leaderboard-cats">
            {otherCategories.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`leaderboard-cat-btn ${
                    activeCategory === category.id ? 'leaderboard-cat-btn--active' : ''
                  }`.trim()}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="leaderboard-banner">
          <span className="leaderboard-banner__label">
            {isStreakCategory ? 'All-time best streak' : categories.find((c) => c.id === activeCategory)?.label}
          </span>
        </div>

        {viewerSummary && viewerSummary.mode === (isStreakCategory ? 'streak' : 'rating') ? (
          <div
            className={
              viewerSummary.kind === 'placed'
                ? 'leaderboard-you-banner leaderboard-you-banner--placed'
                : 'leaderboard-you-banner leaderboard-you-banner--muted'
            }
          >
            {!isStreakCategory && viewerSummary.kind === 'placed' ? (
              <p className="leaderboard-you-banner__text">
                Your rank: <strong className="leaderboard-you-banner__rank">#{viewerSummary.rank}</strong>
                <span className="leaderboard-you-banner__dot"> · </span>
                rating <strong>{viewerSummary.rating}</strong>
                {viewerSummary.rank > 50 ? (
                  <span className="leaderboard-you-banner__note"> (outside top 50 shown below)</span>
                ) : null}
              </p>
            ) : null}
            {!isStreakCategory && viewerSummary.kind === 'not_placed' ? (
              <p className="leaderboard-you-banner__text">
                You are not on this leaderboard yet. Play at least {ESTABLISHED_RATING_MIN_ENTRIES} rated games in
                this category to qualify.
              </p>
            ) : null}
            {isStreakCategory && viewerSummary.kind === 'placed' ? (
              <p className="leaderboard-you-banner__text">
                Your all-time best streak: <strong>{viewerSummary.longestStreak}</strong>
                <span className="leaderboard-you-banner__dot"> · </span>
                rank <strong className="leaderboard-you-banner__rank">#{viewerSummary.rank}</strong>
                {viewerSummary.rank > 50 ? (
                  <span className="leaderboard-you-banner__note"> (outside top 50 shown below)</span>
                ) : null}
              </p>
            ) : null}
            {isStreakCategory && viewerSummary.kind === 'not_placed' ? (
              <p className="leaderboard-you-banner__text">
                You do not have a streak record yet. Complete a rated tactic, opening, or live game day to start your
                streak.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="leaderboard-panel">
          {loading ? (
            <div className="leaderboard-state">Loading leaderboard...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="leaderboard-state">
              {isStreakCategory ? (
                <>
                  No streak data yet.
                  <br />
                  <span className="leaderboard-state__hint">Play tactics, openings, or live games to build your daily streak.</span>
                </>
              ) : (
                <>
                  No established players for {categories.find((c) => c.id === activeCategory)?.label} yet (
                  {ESTABLISHED_RATING_MIN_ENTRIES}+ entries needed).
                  <br />
                  <span className="leaderboard-state__hint">Play more games in this category to qualify.</span>
                </>
              )}
            </div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="leaderboard-table__rank">Rank</th>
                    <th>Player</th>
                    {isStreakCategory ? (
                      <th className="leaderboard-table__streak">Best streak</th>
                    ) : (
                      <th className="leaderboard-table__rating">Rating</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player) => (
                    <tr
                      key={player.id}
                      className={viewerUserId && player.id === viewerUserId ? 'leaderboard-table__row--you' : ''}
                    >
                      <td className="leaderboard-table__rank-cell">#{player.rank}</td>
                      <td>
                        <Link href={`/profile/${player.id}`} className="leaderboard-player-link">
                          {player.name}
                        </Link>
                      </td>
                      {isStreakCategory ? (
                        <td className="leaderboard-table__streak-cell">
                          <div className="leaderboard-streak-cell">
                            <StreakFlameBadge
                              variant={streakScoreVariant(player)}
                              value={player.longestStreak}
                              tooltip="Longest streak"
                            />
                          </div>
                        </td>
                      ) : (
                        <td className="leaderboard-table__rating-cell">{player.rating}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
