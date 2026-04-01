// pages/profile.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import { useSupabaseSession } from '../../lib/SessionContext';
import Button from '../../components/Button';
import { hashEmail } from '../../lib/hashEmail';
import { fetchFriendsForUser, fetchFriendshipRow, sendFriendRequest } from '../../lib/friends';
import ProfileBody from '../../components/ProfileBody';

export default function ProfilePage() {
    const session = useSupabaseSession();

    const router = useRouter();
    const { id } = router.query;

    const [userData, setUserData] = useState(null);
    const [friends, setFriends] = useState([]);
    const [viewerId, setViewerId] = useState(null);
    const [friendship, setFriendship] = useState(null);
    const [requestingFriend, setRequestingFriend] = useState(false);
    const [friendRequestMessage, setFriendRequestMessage] = useState('');
    const [friendRequestMessageType, setFriendRequestMessageType] = useState('info');

    useEffect(() => {
        if (!id) return;

        fetchUserData();
        fetchFriendsForUser(id).then(setFriends);
    }, [id, session]);

    useEffect(() => {
        if (!id) return;
        fetchUserData();
        fetchFriendsForUser(id).then(setFriends);
    }, [id]);

    useEffect(() => {
        if (!session?.user?.email) return;
        hashEmail(session.user.email).then(setViewerId).catch(() => setViewerId(null));
    }, [session]);

    useEffect(() => {
        if (!viewerId || !id) return;
        if (viewerId === id) {
            router.replace('/profile');
            return;
        }
        fetchFriendshipRow(viewerId, id).then(setFriendship);
    }, [viewerId, id, router]);

    async function fetchUserData() {
        const { data, error } = await supabase
            .from('User')
            .select('id, email, name, bio')
            .eq('id', id)
            .single();

        if (!error) {
            setUserData(data);
        }
    }

    async function requestFriend() {
        if (!viewerId || !id || requestingFriend) return;
        setRequestingFriend(true);
        setFriendRequestMessage('');

        const result = await sendFriendRequest(viewerId, id);
        if (result.ok) {
            setFriendRequestMessageType('success');
            setFriendRequestMessage('Friend request sent.');
            const row = await fetchFriendshipRow(viewerId, id);
            setFriendship(row || { status: 'pending' });
        } else if (result.code === 'exists') {
            setFriendRequestMessageType('info');
            setFriendRequestMessage('A friend request already exists for this player.');
            const row = await fetchFriendshipRow(viewerId, id);
            if (row) setFriendship(row);
        } else if (result.code === 'forbidden') {
            setFriendRequestMessageType('error');
            setFriendRequestMessage('Friend request blocked by database policy (RLS). Please apply the FriendRequest insert policy.');
        } else {
            setFriendRequestMessageType('error');
            setFriendRequestMessage('Could not send friend request. Please try again.');
        }
        setRequestingFriend(false);
    }

    return (
        <>
            <Head>
                <title>Profile - 960 Dojo</title>
            </Head>

            <main className="profile-page">
                {!userData ? (
                    <p>Loading profile...</p>
                ) : (
                    <ProfileBody
                        user={userData}
                        editable={false}
                        friends={friends}
                        tabsUserId={id}
                        actionSlot={
                            viewerId && viewerId !== id ? (
                                friendship?.status === 'accepted' ? (
                                    <Button disabled style={{ background: '#14532d', border: '1px solid #166534', color: '#e6ffed' }}>
                                        Friends
                                    </Button>
                                ) : friendship?.status === 'pending' ? (
                                    <Button disabled style={{ background: '#334155', color: '#e2e8f0' }}>
                                        Request pending
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={requestFriend}
                                        disabled={requestingFriend}
                                        style={{ background: '#2563eb', color: '#fff', border: '1px solid #1d4ed8' }}
                                    >
                                        {requestingFriend ? 'Sending...' : 'Add friend'}
                                    </Button>
                                )
                            ) : null
                        }
                    />
                )}
                {friendRequestMessage ? (
                    <div
                        style={{
                            maxWidth: 560,
                            margin: '0.75rem auto 0',
                            borderRadius: 10,
                            padding: '0.65rem 0.8rem',
                            fontWeight: 700,
                            fontSize: 13,
                            border: friendRequestMessageType === 'success'
                                ? '1px solid #15803d'
                                : friendRequestMessageType === 'error'
                                    ? '1px solid #991b1b'
                                    : '1px solid #334155',
                            color: friendRequestMessageType === 'success'
                                ? '#86efac'
                                : friendRequestMessageType === 'error'
                                    ? '#fca5a5'
                                    : '#cbd5e1',
                            background: friendRequestMessageType === 'success'
                                ? 'rgba(22, 163, 74, 0.12)'
                                : friendRequestMessageType === 'error'
                                    ? 'rgba(185, 28, 28, 0.14)'
                                    : 'rgba(51, 65, 85, 0.2)',
                        }}
                    >
                        {friendRequestMessage}
                    </div>
                ) : null}
            </main>
        </>
    );
}
