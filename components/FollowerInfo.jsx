"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function FollowerInfo({ userId }) {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const { data: followersData } = await supabase
                .from("Follower")
                .select("follower_id")
                .eq("followed_id", userId);

            const { data: followingData } = await supabase
                .from("Follower")
                .select("followed_id")
                .eq("follower_id", userId);

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
                    <ul>{followers.map(f => <li key={f.follower_id}>{f.follower_id}</li>)}</ul>
                </div>
                <div>
                    <h4>Following</h4>
                    <ul>{following.map(f => <li key={f.followed_id}>{f.followed_id}</li>)}</ul>
                </div>
            </div>
        </div>
    );
}