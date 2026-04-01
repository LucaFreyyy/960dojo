import { supabase } from '../lib/supabase';
import { useSupabaseSession } from '../lib/SessionContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dropdown() {
    const session = useSupabaseSession();
    const isAuthenticated = !!session;
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!session?.user?.email) return;

        async function fetchName() {
            const encoder = new TextEncoder();
            const data = encoder.encode(session.user.email);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const id = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const { data: userData } = await supabase
                .from('User')
                .select('name')
                .eq('id', id)
                .maybeSingle();

            if (userData?.name) setUserName(userData.name);
        }

        fetchName();
    }, [session]);
    
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <aside className="sidebar-nav sidebar-static">
            <div className="sidebar-head">
                <strong>{userName ? `♔ ${userName.split(' ')[0]}` : 'Navigation'}</strong>
            </div>
            <div className="sidebar-links">
                {isAuthenticated ? (
                    <>
                        <Link href="/profile">👤 Profile</Link>
                        <Link href="/leaderboard">🏆 Leaderboard</Link>
                        <Link href="/playerSearch">🔍 Player Search</Link>
                        <Link href="/settings">⚙️ Settings</Link>
                        <Link href="/info">ℹ️ Info</Link>
                        <a onClick={handleSignOut} style={{ cursor: 'pointer' }}>🚪 Sign Out</a>
                    </>
                ) : (
                    <>
                        <Link href="/leaderboard">🏆 Leaderboard</Link>
                        <Link href="/playerSearch">🔍 Player Search</Link>
                        <Link href="/settings">⚙️ Settings</Link>
                        <Link href="/info">ℹ️ Info</Link>
                        <Link href="/login">🔐 Sign In</Link>
                    </>
                )}
            </div>
        </aside>
    );
}