import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function FollowStats({ user }) {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        fetchFollowData();
    }, [user.id]);

    async function fetchFollowData() {
        // Step 1: Get follower and following IDs
        const { data: followerData, error: err1 } = await supabase
            .from('Follower')
            .select('followerId')
            .eq('followingId', user.id);

        const { data: followingData, error: err2 } = await supabase
            .from('Follower')
            .select('followingId')
            .eq('followerId', user.id);

        if (err1) console.error('Follower fetch error', err1);
        if (err2) console.error('Following fetch error', err2);

        const followerIds = followerData?.map(f => f.followerId) ?? [];
        const followingIds = followingData?.map(f => f.followingId) ?? [];

        // Step 2: Fetch full user info for those IDs
        const { data: followerUsers, error: err3 } = await supabase
            .from('User')
            .select('id, name')
            .in('id', followerIds);

        const { data: followingUsers, error: err4 } = await supabase
            .from('User')
            .select('id, name')
            .in('id', followingIds);

        if (err3) console.error('Follower users fetch error', err3);
        if (err4) console.error('Following users fetch error', err4);

        setFollowers(followerUsers || []);
        setFollowing(followingUsers || []);
    }

    return (
        <div className="follow-stats">
            <div className="follow-counts">
                <div>
                    <strong>{followers.length}</strong>
                    <p>Followers</p>
                </div>
                <div>
                    <strong>{following.length}</strong>
                    <p>Following</p>
                </div>
            </div>

            <div className="follow-lists">
                <div>
                    <h4>Followers</h4>
                    <ul className="followlist">
                        {followers.map((user) => (
                            <li key={user.id}>
                                <a href={`/profile/${user.id}`} className="text-blue-600 hover:underline">
                                    {user.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Following</h4>
                    <ul className="followlist">
                        {following.map((user) => (
                            <li key={user.id}>
                                <a href={`/profile/${user.id}`} className="text-blue-600 hover:underline">
                                    {user.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
