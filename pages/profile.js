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
            console.log('Session:', session);
            fetchUserData();
            fetchFollowerData();
        }
    }, [session]);

    async function fetchUserData() {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', session.user.email)
            .single();

        console.log("Fetched User:", data, "Error:", error);
        if (!error) {
            setUserData(data);
        }
    }

    async function fetchFollowerData() {
        const userId = session.user.id;

        const { data: followersData } = await supabase
            .from('Follower')
            .select('follower_id, follower:User!Follower_follower_id_fkey(*)')
            .eq('followed_id', userId);

        const { data: followingData } = await supabase
            .from('Follower')
            .select('followed_id, followed:User!Follower_followed_id_fkey(*)')
            .eq('follower_id', userId);

        setFollowers(followersData?.map(f => f.follower) || []);
        setFollowing(followingData?.map(f => f.followed) || []);
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
                        <ProfileHeader user={userData} />
                        <FollowStats
                            user={userData}
                            followers={followers}
                            following={following}
                        />
                        <ProfileTabs userId={session.user.id} />
                    </>
                )}
            </main>
        </>
    );
}
