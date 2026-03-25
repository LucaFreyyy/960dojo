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
        { id: 'bullet', label: 'Bullet', icon: '🔫' },
        { id: 'blitz', label: 'Blitz', icon: '⚡' },
        { id: 'rapid', label: 'Rapid', icon: '🚀' },
        { id: 'classical', label: 'Classical', icon: '🏛️' },
        { id: 'tactics', label: 'Tactics', icon: '🎯' },
        { id: 'openings', label: 'Openings', icon: '📚' }
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

    function getRatingIcon(rating) {
        if (rating >= 2500) return '👑';
        if (rating >= 2200) return '🏆';
        if (rating >= 2000) return '⭐';
        if (rating >= 1800) return '🎯';
        if (rating >= 1600) return '📈';
        if (rating >= 1400) return '🌱';
        return '🎲';
    }

    function getCategoryTitle() {
        const category = categories.find(c => c.id === activeCategory);
        return category ? `${category.icon} ${category.label} Leaderboard` : 'Leaderboard';
    }

    return (
        <>
            <Head>
                <title>{getCategoryTitle()} - 960 Dojo</title>
            </Head>
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem 1rem',
                minHeight: '100vh'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                }}>
                    Chess 960 Leaderboard
                </h1>
                <p style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    marginBottom: '2rem'
                }}>
                    Top 50 players by rating category
                </p>

                {/* Category Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '12px',
                                backgroundColor: activeCategory === category.id ? '#3b82f6' : '#1f2937',
                                color: activeCategory === category.id ? 'white' : '#e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                boxShadow: activeCategory === category.id ? '0 4px 6px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
                                transform: activeCategory === category.id ? 'scale(1.02)' : 'scale(1)'
                            }}
                            onMouseEnter={(e) => {
                                if (activeCategory !== category.id) {
                                    e.target.style.backgroundColor = '#374151';
                                    e.target.style.transform = 'scale(1.02)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeCategory !== category.id) {
                                    e.target.style.backgroundColor = '#1f2937';
                                    e.target.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                            <span>{category.label}</span>
                        </button>
                    ))}
                </div>

                {/* Current Category Display */}
                <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.label}
                    </span>
                </div>

                {/* Leaderboard Table */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#6b7280'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>♟️</div>
                            Loading leaderboard...
                        </div>
                    ) : leaderboardData.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#6b7280'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            No players with {categories.find(c => c.id === activeCategory)?.label} ratings yet.
                            <br />
                            <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                                Start playing to appear on the leaderboard!
                            </span>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                overflowX: 'auto'
                            }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse'
                                }}>
                                    <thead>
                                        <tr style={{
                                            backgroundColor: '#f3f4f6',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <th style={{
                                                padding: '1rem',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#374151',
                                                width: '80px'
                                            }}>
                                                Rank
                                            </th>
                                            <th style={{
                                                padding: '1rem',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#374151'
                                            }}>
                                                Player
                                            </th>
                                            <th style={{
                                                padding: '1rem',
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: '#374151',
                                                width: '120px'
                                            }}>
                                                Rating
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardData.map((player) => (
                                            <tr
                                                key={player.id}
                                                style={{
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'white';
                                                }}
                                            >
                                                <td style={{
                                                    padding: '1rem',
                                                    fontWeight: '600',
                                                    color: '#6b7280'
                                                }}>
                                                    #{player.rank}
                                                </td>
                                                <td style={{
                                                    padding: '1rem'
                                                }}>
                                                    <Link
                                                        href={`/profile/${player.id}`}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: '#1f2937',
                                                            fontWeight: '500',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.25rem' }}>
                                                            {getRatingIcon(player.rating)}
                                                        </span>
                                                        {player.name}
                                                    </Link>
                                                </td>
                                                <td style={{
                                                    padding: '1rem',
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    color: '#3b82f6',
                                                    fontSize: '1.1rem'
                                                }}>
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