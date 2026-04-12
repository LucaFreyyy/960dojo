import { useState, useEffect } from 'react';
import RatingGraph from './RatingGraph';
import GameList from './GameList';
import ProfileActivityFeed from './ProfileActivityFeed';
import RatingEstablishedHint from './RatingEstablishedHint';
import { supabase } from '../lib/supabase';
import { ESTABLISHED_RATING_MIN_ENTRIES } from '../lib/ratingConstants';

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
    const [profileProvisional, setProfileProvisional] = useState(false);
    const [viewerProvisional, setViewerProvisional] = useState(false);

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

            const { count: profileCount, error: profileCountErr } = await supabase
                .from('Rating')
                .select('id', { count: 'exact', head: true })
                .eq('userId', userId)
                .eq('type', dbFormat);

            if (profileCountErr) {
                console.warn(`[ProfileTabs] Rating count for profile:`, profileCountErr.message);
            }
            setProfileProvisional((profileCount ?? 0) < ESTABLISHED_RATING_MIN_ENTRIES);

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
                const { count: viewerCount, error: viewerCountErr } = await supabase
                    .from('Rating')
                    .select('id', { count: 'exact', head: true })
                    .eq('userId', compareUserId)
                    .eq('type', dbFormat);
                if (viewerCountErr) {
                    console.warn(`[ProfileTabs] Rating count for viewer:`, viewerCountErr.message);
                }
                setViewerProvisional((viewerCount ?? 0) < ESTABLISHED_RATING_MIN_ENTRIES);
                if (vErr) {
                    console.warn(`[ProfileTabs] No viewer rating for ${dbFormat}:`, vErr.message);
                    setViewerRating(null);
                } else {
                    setViewerRating(vData?.value ?? null);
                }
            } else {
                setViewerRating(null);
                setViewerProvisional(false);
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
                            <span className="profile-tab-rating-profile">
                                {profileLabel}:{' '}
                                <span className="profile-tab-rating-with-hint">
                                    {rating ?? '–'}
                                    {profileProvisional ? <RatingEstablishedHint /> : null}
                                </span>
                            </span>
                            <span className="profile-tab-rating-sep" aria-hidden="true"> · </span>
                            <span className="profile-tab-rating-viewer">
                                You:{' '}
                                <span className="profile-tab-rating-with-hint">
                                    {viewerRating ?? '–'}
                                    {viewerProvisional ? <RatingEstablishedHint /> : null}
                                </span>
                            </span>
                        </>
                    ) : (
                        <>
                            Rating:{' '}
                            <span className="profile-tab-rating-with-hint">
                                {rating ?? '–'}
                                {profileProvisional ? <RatingEstablishedHint /> : null}
                            </span>
                        </>
                    )}
                </h3>
                <RatingGraph
                    userId={userId}
                    format={formatMap[activeTab]}
                    compareUserId={compareUserId}
                    profileName={profileName}
                />
                {activeTab === 'Tactics' ? (
                    <ProfileActivityFeed userId={userId} variant="tactics" />
                ) : activeTab === 'Openings' ? (
                    <ProfileActivityFeed userId={userId} variant="openings" />
                ) : (
                    <GameList userId={userId} format={formatMap[activeTab]} />
                )}
            </div>
        </div>
    );
}
