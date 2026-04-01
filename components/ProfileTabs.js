import { useState, useEffect } from 'react';
import RatingGraph from './RatingGraph';
import GameList from './GameList';
import { supabase } from '../lib/supabase';

const formats = ['Bullet', 'Blitz', 'Rapid', 'Classical', 'Tactics', 'Openings'];
const formatMap = {
    Bullet: 'bullet',
    Blitz: 'blitz',
    Rapid: 'rapid',
    Classical: 'classical',
    Tactics: 'tactics',
    Openings: 'openings',
};

export default function ProfileTabs({ userId, compareUserId = null, profileName }) {
    const [activeTab, setActiveTab] = useState('Bullet');
    const [rating, setRating] = useState(null);
    const [viewerRating, setViewerRating] = useState(null);

    const compareMode = Boolean(compareUserId && compareUserId !== userId);
    const profileLabel = profileName?.trim() || 'Player';

    useEffect(() => {
        async function fetchRating() {
            const dbFormat = formatMap[activeTab];
            const { data, error } = await supabase
                .from('Rating')
                .select('value')
                .eq('userId', userId)
                .eq('type', dbFormat)
                .order('createdAt', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.warn(`[ProfileTabs] No rating found for ${dbFormat}:`, error.message);
                setRating(null);
            } else {
                setRating(data?.value ?? null);
            }

            if (compareUserId && compareUserId !== userId) {
                const { data: vData, error: vErr } = await supabase
                    .from('Rating')
                    .select('value')
                    .eq('userId', compareUserId)
                    .eq('type', dbFormat)
                    .order('createdAt', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (vErr) {
                    console.warn(`[ProfileTabs] No viewer rating for ${dbFormat}:`, vErr.message);
                    setViewerRating(null);
                } else {
                    setViewerRating(vData?.value ?? null);
                }
            } else {
                setViewerRating(null);
            }
        }

        fetchRating();
    }, [activeTab, userId, compareUserId]);

    return (
        <div className="profile-tabs">
            <div className="tab-icons">
                {formats.map(f => (
                    <button key={f} onClick={() => setActiveTab(f)} className={activeTab === f ? 'active' : ''}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                <h3 className="profile-tab-rating-headline">
                    {compareMode ? (
                        <>
                            <span className="profile-tab-rating-profile">{profileLabel}: {rating ?? '–'}</span>
                            <span className="profile-tab-rating-sep" aria-hidden="true"> · </span>
                            <span className="profile-tab-rating-viewer">You: {viewerRating ?? '–'}</span>
                        </>
                    ) : (
                        <>Rating: {rating ?? '–'}</>
                    )}
                </h3>
                <RatingGraph
                    userId={userId}
                    format={formatMap[activeTab]}
                    compareUserId={compareUserId}
                    profileName={profileName}
                />
                <GameList userId={userId} format={formatMap[activeTab]} />
            </div>
        </div>
    );
}
