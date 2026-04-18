import { supabase } from '../lib/supabase';
import { useSupabaseSession } from '../lib/SessionContext';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePlayUi } from '../lib/PlayUiContext';

function MenuSection({ title, children }) {
    return (
        <div className="dropdown-section">
            <div className="dropdown-section-title">{title}</div>
            {children}
        </div>
    );
}

function DropdownNotificationsItem({ showDot, onClose }) {
    return (
        <Link
            href="/notifications"
            className={`dropdown-item${showDot ? ' dropdown-item--with-notify' : ''}`.trim()}
            role="menuitem"
            onClick={onClose}
            {...(showDot ? { 'aria-label': 'Notifications — unread' } : {})}
        >
            <span>Notifications</span>
            {showDot ? <span className="notification-pip" aria-hidden /> : null}
        </Link>
    );
}

export default function Dropdown() {
    const session = useSupabaseSession();
    const { status: playStatus } = usePlayUi();
    const isAuthenticated = !!session;
    const playUnread = Number(playStatus?.unreadNotifications) || 0;
    const pendingFriends = Number(playStatus?.pendingFriendRequests) || 0;
    const unreadFeedback = Number(playStatus?.unreadFeedback) || 0;
    const hasPendingNotifications =
        playUnread > 0 || pendingFriends > 0 || unreadFeedback > 0;
    const [userName, setUserName] = useState('');
    const [open, setOpen] = useState(false);

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

    const close = () => setOpen(false);
    const showNotifyDot = isAuthenticated && hasPendingNotifications;
    const notifyAlert = isAuthenticated && hasPendingNotifications;

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                type="button"
                className={`dropbtn${notifyAlert ? ' dropbtn--notify-pending' : ''}`}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Menu"
                title="Menu"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
            >
                <span className="dropbtn-label">{userName ? userName.split(' ')[0] : 'Menu'}</span>
                <span className="dropbtn-chevron" aria-hidden>
                    {open ? '▴' : '▾'}
                </span>
            </button>
            {open ? (
                <div className="dropdown-content" role="menu">
                    {isAuthenticated ? (
                        <>
                            <MenuSection title="Account">
                                <Link href="/profile" className="dropdown-item" role="menuitem" onClick={close}>
                                    Profile
                                </Link>
                                <DropdownNotificationsItem showDot={showNotifyDot} onClose={close} />
                                <Link href="/settings" className="dropdown-item" role="menuitem" onClick={close}>
                                    Settings
                                </Link>
                            </MenuSection>
                            <MenuSection title="Community">
                                <Link href="/leaderboard" className="dropdown-item" role="menuitem" onClick={close}>
                                    Leaderboard
                                </Link>
                                <Link href="/playerSearch" className="dropdown-item" role="menuitem" onClick={close}>
                                    Player search
                                </Link>
                            </MenuSection>
                            <MenuSection title="About">
                                <Link href="/info" className="dropdown-item" role="menuitem" onClick={close}>
                                    Info
                                </Link>
                                <Link href="/legal" className="dropdown-item" role="menuitem" onClick={close}>
                                    Legal
                                </Link>
                                <Link href="/feedback" className="dropdown-item" role="menuitem" onClick={close}>
                                    Feedback
                                </Link>
                            </MenuSection>
                            <div className="dropdown-section dropdown-section--footer">
                                <button
                                    type="button"
                                    className="dropdown-item dropdown-item--signout"
                                    role="menuitem"
                                    onClick={() => {
                                        close();
                                        handleSignOut();
                                    }}
                                >
                                    Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <MenuSection title="Account">
                                <Link href="/login" className="dropdown-item" role="menuitem" onClick={close}>
                                    Sign in
                                </Link>
                                <DropdownNotificationsItem showDot={showNotifyDot} onClose={close} />
                                <Link href="/settings" className="dropdown-item" role="menuitem" onClick={close}>
                                    Settings
                                </Link>
                            </MenuSection>
                            <MenuSection title="Community">
                                <Link href="/leaderboard" className="dropdown-item" role="menuitem" onClick={close}>
                                    Leaderboard
                                </Link>
                                <Link href="/playerSearch" className="dropdown-item" role="menuitem" onClick={close}>
                                    Player search
                                </Link>
                            </MenuSection>
                            <MenuSection title="About">
                                <Link href="/info" className="dropdown-item" role="menuitem" onClick={close}>
                                    Info
                                </Link>
                                <Link href="/legal" className="dropdown-item" role="menuitem" onClick={close}>
                                    Legal
                                </Link>
                                <Link href="/feedback" className="dropdown-item" role="menuitem" onClick={close}>
                                    Feedback
                                </Link>
                            </MenuSection>
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
}
