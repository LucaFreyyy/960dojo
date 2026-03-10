import { supabase } from '../lib/supabase';
import { useSupabaseSession } from '../lib/SessionContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Dropdown() {
    const session = useSupabaseSession();
    const isAuthenticated = !!session;
    const userName = session?.user?.email;
    const [open, setOpen] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [clickedOpen, setClickedOpen] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setClickedOpen(false);
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setOpen(clickedOpen ? true : hovering);
    }, [hovering, clickedOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <div className="dropdown" ref={dropdownRef}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => { setHovering(false); if (!clickedOpen) setOpen(false); }}>
            <button className="dropbtn" onClick={(e) => { e.stopPropagation(); setClickedOpen(!clickedOpen); }}>
                {userName ? `♔ ${userName.split(' ')[0]}` : '♟'}
            </button>
            {open && (
                <div className={`dropdown-content ${open ? 'open' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link href="/profile">👤 Profile</Link>
                            <Link href="/playerSearch">🔍 Player Search</Link>
                            <Link href="/settings">⚙️ Settings</Link>
                            <Link href="/info">ℹ️ Info</Link>
                            <a onClick={handleSignOut} style={{ cursor: 'pointer' }}>🚪 Sign Out</a>
                        </>
                    ) : (
                        <>
                            <Link href="/playerSearch">🔍 Player Search</Link>
                            <Link href="/settings">⚙️ Settings</Link>
                            <Link href="/info">ℹ️ Info</Link>
                            <Link href="/login">🔐 Sign In</Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}