import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function ProfileSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers([]);
        } else {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    async function fetchAllUsers() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('User')
                .select('id, name, email')
                .order('name');

            if (error) {
                console.error('Error fetching users:', error);
                return;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Profile Search - 960 Dojo</title>
            </Head>
            <main className="page-shell--center player-search-page">
                <h1 className="player-search-title">
                    Profile Search
                </h1>

                <div className="player-search-field-wrap">
                    <input
                        type="text"
                        placeholder="Search for a player by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="player-search-input"
                    />
                </div>

                <div className="player-search-results">
                    {loading && (
                        <p className="player-search-hint">Loading users...</p>
                    )}

                    {!loading && searchTerm && filteredUsers.length === 0 && (
                        <p className="player-search-hint">
                            No players found matching &quot;{searchTerm}&quot;
                        </p>
                    )}

                    {!loading && filteredUsers.length > 0 && (
                        <div className="player-search-list">
                            {filteredUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    className="player-search-card"
                                >
                                    <div className="player-search-card__name">
                                        {user.name}
                                    </div>
                                    <div className="player-search-card__meta">
                                        View profile →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && !searchTerm && (
                        <p className="player-search-hint">
                            Enter a name to search for players
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
