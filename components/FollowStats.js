import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function FollowStats({ user }) {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        fetchFollowData();
    }, [user.id]);

    async function fetchFollowData() {
        const { data: followerData } = await supabase
            .from('Follower')
            .select('follower_id')
            .eq('followed_id', user.id);

        const { data: followingData } = await supabase
            .from('Follower')
            .select('followed_id')
            .eq('follower_id', user.id);

        setFollowers(followerData || []);
        setFollowing(followingData || []);
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
                    <ul>
                        {followers.map((f, i) => (
                            <li key={i}>{f.follower_id}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Following</h4>
                    <ul>
                        {following.map((f, i) => (
                            <li key={i}>{f.followed_id}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}