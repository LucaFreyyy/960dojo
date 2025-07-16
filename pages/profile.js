// pages/profile.js
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProfileHeader from '../components/ProfileHeader';
import FollowStats from '../components/FollowStats';
import ProfileTabs from '../components/ProfileTabs';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [userData, setUserData] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        if (session) {
            fetchUserData();
            fetchFollowerData();
        }
    }, [session]);

    async function fetchUserData() {
        const { data, error } = await supabase
            .from('User')
            .select('id, email, name, bio')
            .eq('id', session.user.id)
            .single();

        if (!error) {
            setUserData(data);
        }
    }

    async function fetchFollowerData() {
        const userId = session.user.id;

        // Fetch follower IDs
        const { data: followersData, error: followersError } = await supabase
            .from('Follower')
            .select('followerId')
            .eq('followingId', userId);

        const followerIds = followersData?.map(f => f.followerId) ?? [];

        // Fetch follower user info
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

        // Fetch following user info
        const { data: followingUsers, error: followingUsersError } = await supabase
            .from('User')
            .select('id, name')
            .in('id', followingIds);

        // Log errors if any
        if (followersError) console.error('[fetchFollowerData] Followers error:', followersError);
        if (followerUsersError) console.error('[fetchFollowerData] Follower users error:', followerUsersError);
        if (followingError) console.error('[fetchFollowerData] Following error:', followingError);
        if (followingUsersError) console.error('[fetchFollowerData] Following users error:', followingUsersError);

        // Set state
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
                        <ProfileHeader user={userData} editable={true} />
                        <FollowStats
                            user={userData}
                            followers={followers.map(f => f.name)}
                            following={following.map(f => f.name)}
                        />
                        <ProfileTabs userId={session.user.id} />
                    </>
                )}
            </main>
        </>
    );
}
