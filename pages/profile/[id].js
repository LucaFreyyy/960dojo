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
import { streakFromUserRow } from '../../lib/streakFromUserRow';

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
            .select('id, email, name, bio, Streak(userId, currentStreak, longestStreak, lastActivityDate)')
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
                        compareUserId={viewerId && viewerId !== id ? viewerId : null}
                        profileName={userData?.name}
                        streakRow={streakFromUserRow(userData)}
                        actionSlot={
                            viewerId && viewerId !== id ? (
                                friendship?.status === 'accepted' ? (
                                    <Button disabled variant="success">
                                        Friends
                                    </Button>
                                ) : friendship?.status === 'pending' ? (
                                    <Button disabled variant="muted">
                                        Request pending
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={requestFriend}
                                        disabled={requestingFriend}
                                        variant="primary"
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
                        className={`friend-request-banner ${
                            friendRequestMessageType === 'success'
                                ? 'friend-request-banner--success'
                                : friendRequestMessageType === 'error'
                                    ? 'friend-request-banner--error'
                                    : 'friend-request-banner--info'
                        }`.trim()}
                    >
                        {friendRequestMessage}
                    </div>
                ) : null}
            </main>
        </>
    );
}
