import { supabase } from '../lib/supabase';
import { useSupabaseSession } from '../lib/SessionContext';
import { useState, useEffect, useRef } from 'react';
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
    
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                className="dropbtn sidebar-toggle-btn"
                aria-label={open ? 'Close sidebar' : 'Open sidebar'}
                title={open ? 'Close sidebar' : 'Open sidebar'}
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            >
                <span className="sidebar-toggle-icon">☰</span>
            </button>
            {open ? (
                <>
                    <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
                    <aside className="sidebar-nav sidebar-open">
                        <div className="sidebar-head">
                            <strong>{userName ? `♔ ${userName.split(' ')[0]}` : 'Navigation'}</strong>
                            <button type="button" className="sidebar-close" onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <div className="sidebar-links">
                            {isAuthenticated ? (
                                <>
                                    <Link href="/notifications">🔔 Notifications</Link>
                                    <Link href="/profile">👤 Profile</Link>
                                    <Link href="/leaderboard">🏆 Leaderboard</Link>
                                    <Link href="/playerSearch">🔍 Player Search</Link>
                                    <Link href="/settings">⚙️ Settings</Link>
                                    <Link href="/info">ℹ️ Info</Link>
                                    <a onClick={handleSignOut} style={{ cursor: 'pointer' }}>🚪 Sign Out</a>
                                </>
                            ) : (
                                <>
                                    <Link href="/notifications">🔔 Notifications</Link>
                                    <Link href="/leaderboard">🏆 Leaderboard</Link>
                                    <Link href="/playerSearch">🔍 Player Search</Link>
                                    <Link href="/settings">⚙️ Settings</Link>
                                    <Link href="/info">ℹ️ Info</Link>
                                    <Link href="/login">🔐 Sign In</Link>
                                </>
                            )}
                        </div>
                    </aside>
                </>
            ) : null}
        </div>
    );
}