// pages/leaderboard.js or app/leaderboard/page.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function LeaderboardPage() {
    const [activeCategory, setActiveCategory] = useState('openings');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const categories = [
        { id: 'bullet', label: 'Bullet' },
        { id: 'blitz', label: 'Blitz' },
        { id: 'rapid', label: 'Rapid' },
        { id: 'classical', label: 'Classical' },
        { id: 'tactics', label: 'Tactics' },
        { id: 'openings', label: 'Openings' }
    ];

    useEffect(() => {
        fetchLeaderboard();
    }, [activeCategory]);

    async function fetchLeaderboard() {
        try {
            setLoading(true);
            
            // First, get the latest rating for each user and category
            const { data: ratingsData, error: ratingsError } = await supabase
                .from('Rating')
                .select('userId, type, value, createdAt')
                .eq('type', activeCategory)
                .order('createdAt', { ascending: false });

            if (ratingsError) {
                console.error('Error fetching ratings:', ratingsError);
                return;
            }

            // Get unique latest rating per user
            const userLatestRatings = {};
            ratingsData?.forEach(rating => {
                if (!userLatestRatings[rating.userId] || 
                    new Date(rating.createdAt) > new Date(userLatestRatings[rating.userId].createdAt)) {
                    userLatestRatings[rating.userId] = rating;
                }
            });

            // Get user details for all users with ratings
            const userIds = Object.keys(userLatestRatings);
            if (userIds.length === 0) {
                setLeaderboardData([]);
                setLoading(false);
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

            // Combine user data with ratings
            const combinedData = userIds
                .map(userId => {
                    const user = usersData.find(u => u.id === userId);
                    const rating = userLatestRatings[userId];
                    return {
                        id: userId,
                        name: user?.name || 'Unknown Player',
                        rating: rating?.value || 0,
                        createdAt: rating?.createdAt
                    };
                })
                .filter(item => item.rating > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 50)
                .map((item, index) => ({
                    ...item,
                    rank: index + 1
                }));

            setLeaderboardData(combinedData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

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

                <div className="leaderboard-panel">
                    {loading ? (
                        <div className="leaderboard-state">
                            Loading leaderboard...
                        </div>
                    ) : leaderboardData.length === 0 ? (
                        <div className="leaderboard-state">
                            No players with {categories.find(c => c.id === activeCategory)?.label} ratings yet.
                            <br />
                            <span className="leaderboard-state__hint">
                                Start playing to appear on the leaderboard!
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
                                            <tr key={player.id}>
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