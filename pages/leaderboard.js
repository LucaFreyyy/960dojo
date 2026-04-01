// pages/leaderboard.js or app/leaderboard/page.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { ESTABLISHED_RATING_MIN_ENTRIES } from '../lib/ratingConstants';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';

export default function LeaderboardPage() {
    const session = useSupabaseSession();
    const [viewerUserId, setViewerUserId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('openings');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    /** null = guest; placed = on full sorted board; not_placed = logged in but not established / no row */
    const [viewerSummary, setViewerSummary] = useState(null);

    const categories = [
        { id: 'bullet', label: 'Bullet' },
        { id: 'blitz', label: 'Blitz' },
        { id: 'rapid', label: 'Rapid' },
        { id: 'classical', label: 'Classical' },
        { id: 'tactics', label: 'Tactics' },
        { id: 'openings', label: 'Openings' }
    ];

    useEffect(() => {
        if (!session?.user?.email) {
            setViewerUserId(null);
            setViewerSummary(null);
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

        async function fetchLeaderboard() {
            try {
                setLoading(true);

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
                    if (!userLatestRatings[rating.userId]
                        || new Date(rating.createdAt) > new Date(userLatestRatings[rating.userId].createdAt)) {
                        userLatestRatings[rating.userId] = rating;
                    }
                });

                const userIds = Object.keys(userLatestRatings).filter(
                    (uid) => (entryCountByUser[uid] || 0) >= ESTABLISHED_RATING_MIN_ENTRIES
                );
                if (userIds.length === 0) {
                    if (!cancelled) {
                        setLeaderboardData([]);
                        setViewerSummary(
                            viewerUserId ? { kind: 'not_placed' } : null
                        );
                    }
                    return;
                }

                const { data: usersData, error: usersError } = await supabase
                    .from('User')
                    .select('id, name')
                    .in('id', userIds);

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
                            createdAt: rating?.createdAt
                        };
                    })
                    .filter((item) => item.rating > 0)
                    .sort((a, b) => b.rating - a.rating)
                    .map((item, index) => ({
                        ...item,
                        rank: index + 1
                    }));

                const top50 = sortedAll.slice(0, 50);

                let nextViewerSummary = null;
                if (viewerUserId) {
                    const me = sortedAll.find((p) => p.id === viewerUserId);
                    nextViewerSummary = me
                        ? { kind: 'placed', rank: me.rank, rating: me.rating }
                        : { kind: 'not_placed' };
                }

                if (!cancelled) {
                    setLeaderboardData(top50);
                    setViewerSummary(nextViewerSummary);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchLeaderboard();
        return () => {
            cancelled = true;
        };
    }, [activeCategory, viewerUserId]);

    function getCategoryTitle() {
        const category = categories.find(c => c.id === activeCategory);
        return category ? `${category.label} Leaderboard` : 'Leaderboard';
    }

    return (
        <>
            <Head>
                <title>{getCategoryTitle()} - 960 Dojo</title>
            </Head>
            <main className="leaderboard-page">
                <h1 className="leaderboard-title">
                    Chess 960 Leaderboard
                </h1>
                <p className="leaderboard-sub">
                    Top 50 players by rating category
                </p>

                <div className="leaderboard-cats">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveCategory(category.id)}
                            className={`leaderboard-cat-btn ${activeCategory === category.id ? 'leaderboard-cat-btn--active' : ''}`.trim()}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                <div className="leaderboard-banner">
                    <span className="leaderboard-banner__label">
                        {categories.find(c => c.id === activeCategory)?.label}
                    </span>
                </div>

                {viewerSummary ? (
                    <div
                        className={
                            viewerSummary.kind === 'placed'
                                ? 'leaderboard-you-banner leaderboard-you-banner--placed'
                                : 'leaderboard-you-banner leaderboard-you-banner--muted'
                        }
                    >
                        {viewerSummary.kind === 'placed' ? (
                            <p className="leaderboard-you-banner__text">
                                Your rank in{' '}
                                <span className="leaderboard-you-banner__cat">
                                    {categories.find((c) => c.id === activeCategory)?.label}
                                </span>
                                :{' '}
                                <strong className="leaderboard-you-banner__rank">#{viewerSummary.rank}</strong>
                                <span className="leaderboard-you-banner__dot"> · </span>
                                rating{' '}
                                <strong>{viewerSummary.rating}</strong>
                                {viewerSummary.rank > 50 ? (
                                    <span className="leaderboard-you-banner__note">
                                        {' '}
                                        (outside top 50 shown below)
                                    </span>
                                ) : null}
                            </p>
                        ) : (
                            <p className="leaderboard-you-banner__text">
                                You are not on this leaderboard yet. Play at least{' '}
                                {ESTABLISHED_RATING_MIN_ENTRIES} rated games in this category to qualify.
                            </p>
                        )}
                    </div>
                ) : null}

                <div className="leaderboard-panel">
                    {loading ? (
                        <div className="leaderboard-state">
                            Loading leaderboard...
                        </div>
                    ) : leaderboardData.length === 0 ? (
                        <div className="leaderboard-state">
                            No established players for {categories.find(c => c.id === activeCategory)?.label} yet
                            ({ESTABLISHED_RATING_MIN_ENTRIES}+ entries needed).
                            <br />
                            <span className="leaderboard-state__hint">
                                Play more games in this category to qualify.
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="leaderboard-table-wrap">
                                <table className="leaderboard-table">
                                    <thead>
                                        <tr>
                                            <th className="leaderboard-table__rank">Rank</th>
                                            <th>Player</th>
                                            <th className="leaderboard-table__rating">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardData.map((player) => (
                                            <tr
                                                key={player.id}
                                                className={
                                                    viewerUserId && player.id === viewerUserId
                                                        ? 'leaderboard-table__row--you'
                                                        : ''
                                                }
                                            >
                                                <td className="leaderboard-table__rank-cell">
                                                    #{player.rank}
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/profile/${player.id}`}
                                                        className="leaderboard-player-link"
                                                    >
                                                        {player.name}
                                                    </Link>
                                                </td>
                                                <td className="leaderboard-table__rating-cell">
                                                    {player.rating}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}