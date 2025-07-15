import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function FollowStats({ user }) {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        fetchFollowData();
    }, [user.id]);

    async function fetchFollowData() {
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
                            <li key={i}>{f.followerId}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Following</h4>
                    <ul>
                        {following.map((f, i) => (
                            <li key={i}>{f.followingId}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
