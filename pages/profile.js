import Head from 'next/head';
import { useSupabaseSession } from '../lib/SessionContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProfileBody from '../components/ProfileBody';
import { hashEmail } from '../lib/hashEmail';
import { fetchFriendsForUser } from '../lib/friends';
import { streakFromUserRow } from '../lib/streakFromUserRow';

export default function ProfilePage() {
    const session = useSupabaseSession();
    const [userData, setUserData] = useState(null);
    const [friends, setFriends] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (!session) return;
        const email = session?.user?.email;
        if (!email) return;
        hashEmail(email).then(id => setUserId(id));
    }, [session]);

    useEffect(() => {
        if (!userId) return;
        fetchUserData();
        fetchFriendsForUser(userId).then(setFriends);
    }, [userId]);

    async function checkUsernameAvailable(newName) {
        const { data } = await supabase
            .from('User')
            .select('id')
            .eq('name', newName.trim())
            .maybeSingle();
        return !data || data.id === userId;
    }

    async function fetchUserData() {
        const { data, error } = await supabase
            .from('User')
            .select('id, email, name, bio, Streak(userId, currentStreak, longestStreak, lastActivityDate)')
            .eq('id', userId)
            .single();
        if (!error) setUserData(data);
    }

    return (
        <>
            <Head>
                <title>Profile - 960 Dojo</title>
            </Head>
            <main className="profile-page">
                {!session ? (
                    <p>Please log in to view your profile.</p>
                ) : !userData ? (
                    <p>Loading profile...</p>
                ) : (
                    <ProfileBody
                        user={userData}
                        editable={true}
                        checkUsernameAvailable={checkUsernameAvailable}
                        onNameUpdated={fetchUserData}
                        friends={friends}
                        tabsUserId={userId}
                        streakRow={streakFromUserRow(userData)}
                    />
                )}
            </main>
        </>
    );
}