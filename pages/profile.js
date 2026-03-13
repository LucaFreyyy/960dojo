import Head from 'next/head';
import { useSupabaseSession } from '../lib/SessionContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProfileHeader from '../components/ProfileHeader';
import FollowStats from '../components/FollowStats';
import ProfileTabs from '../components/ProfileTabs';

async function hashEmail(email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ProfilePage() {
    const session = useSupabaseSession();
    const [userData, setUserData] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
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
        fetchFollowerData();
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
            .select('id, email, name, bio')
            .eq('id', userId)
            .single();
        if (!error) setUserData(data);
    }

    async function fetchFollowerData() {
        // Fetch follower IDs
        const { data: followersData, error: followersError } = await supabase
            .from('Follower')
            .select('followerId')
            .eq('followingId', userId);

        const followerIds = followersData?.map(f => f.followerId) ?? [];

        const { data: followerUsers, error: followerUsersError } = await supabase
            .from('User')
            .select('id, name')
            .in('id', followerIds);

        // Fetch following IDs
        const { data: followingData, error: followingError } = await supabase
            .from('Follower')
            .select('followingId')
            .eq('followerId', userId);

        const followingIds = followingData?.map(f => f.followingId) ?? [];

        const { data: followingUsers, error: followingUsersError } = await supabase
            .from('User')
            .select('id, name')
            .in('id', followingIds);

        if (followersError) console.error('[fetchFollowerData] Followers error:', followersError);
        if (followerUsersError) console.error('[fetchFollowerData] Follower users error:', followerUsersError);
        if (followingError) console.error('[fetchFollowerData] Following error:', followingError);
        if (followingUsersError) console.error('[fetchFollowerData] Following users error:', followingUsersError);

        setFollowers(followerUsers || []);
        setFollowing(followingUsers || []);
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
                    <>
                        <ProfileHeader user={userData} editable={true} checkUsernameAvailable={checkUsernameAvailable} onNameUpdated={fetchUserData} />
                        <hr className='separating-line' />
                        <FollowStats
                            user={userData}
                            followers={followers.map(f => f.name)}
                            following={following.map(f => f.name)}
                        />
                        <hr className='separating-line' />
                        <ProfileTabs userId={userId} />
                    </>
                )}
            </main>
        </>
    );
}