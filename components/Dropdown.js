import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Dropdown({ isAuthenticated }) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [clickedOpen, setClickedOpen] = useState(false);
    const dropdownRef = useRef();

    // Close if clicked outside
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

    // Determine actual dropdown state
    useEffect(() => {
        if (clickedOpen) {
            setOpen(true);
        } else {
            setOpen(hovering);
        }
    }, [hovering, clickedOpen]);

    return (
        <div
            className="dropdown"
            ref={dropdownRef}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => {
                setHovering(false);
                if (!clickedOpen) setOpen(false);
            }}
        >
            <button
                className="dropbtn"
                onClick={(e) => {
                    e.stopPropagation();
                    setClickedOpen(!clickedOpen);
                }}
            >
                {session?.user?.name ? (
                    <>
                        ♔ {session.user.name.split(' ')[0]}
                    </>
                ) : (
                    '♟'
                )}
            </button>


            {open && (
                <div className={`dropdown-content ${open ? 'open' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link href="/profile">👤 Profile</Link>
                            <Link href="/settings">⚙️ Settings</Link>
                            <Link href="/info">ℹ️ Info</Link>
                            <a onClick={() => signOut({ callbackUrl: '/' })} style={{ cursor: 'pointer' }}>🚪 Sign Out</a>
                        </>
                    ) : (
                        <>
                            <Link href="/settings">⚙️ Settings</Link>
                            <Link href="/info">ℹ️ Info</Link>
                            <a onClick={() => signIn('google')} style={{ cursor: 'pointer' }}>🔐 Sign In</a>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
