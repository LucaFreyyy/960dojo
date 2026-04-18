"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function FollowerInfo({ userId }) {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const { data: followersData, error: followersError } = await supabase
                .from("Follower")
                .select("followerId")
                .eq("followingId", userId);

            const { data: followingData, error: followingError } = await supabase
                .from("Follower")
                .select("followingId")
                .eq("followerId", userId);

            if (followersError) console.error(followersError);
            if (followingError) console.error(followingError);

            setFollowers(followersData || []);
            setFollowing(followingData || []);
        }

        fetchData();
    }, [userId]);

    return (
        <div className="follower-info">
            <div className="counts">
                <div><strong>{followers.length}</strong> Followers</div>
                <div><strong>{following.length}</strong> Following</div>
            </div>
            <div className="lists">
                <div>
                    <h4>Followers</h4>
                    <ul>{followers.map(f => <li key={f.followerId}>{f.followerId}</li>)}</ul>
                </div>
                <div>
                    <h4>Following</h4>
                    <ul>{following.map(f => <li key={f.followingId}>{f.followingId}</li>)}</ul>
                </div>
            </div>
        </div>
    );
}
