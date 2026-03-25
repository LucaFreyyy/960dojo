import Head from 'next/head';
import { FaCoffee } from 'react-icons/fa';
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
            <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem', padding: '0 1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Profile Search
                </h1>

                {/* Search Input */}
                <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        placeholder="Search for a player by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>

                {/* Results */}
                <div style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
                    {loading && (
                        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading users...</p>
                    )}
                    
                    {!loading && searchTerm && filteredUsers.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6b7280' }}>
                            No players found matching "{searchTerm}"
                        </p>
                    )}
                    
                    {!loading && filteredUsers.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    style={{
                                        display: 'block',
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: '#1f2937',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        View profile →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {!loading && !searchTerm && (
                        <p style={{ textAlign: 'center', color: '#6b7280' }}>
                            Enter a name to search for players
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
