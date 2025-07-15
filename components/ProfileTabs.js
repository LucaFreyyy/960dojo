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

export default function ProfileTabs({ userId }) {
    const [activeTab, setActiveTab] = useState('Bullet');
    const [rating, setRating] = useState(null);

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
                .single();

            if (error) {
                console.warn(`[ProfileTabs] No rating found for ${dbFormat}:`, error.message);
                setRating(null);
            } else {
                setRating(data.value);
            }
        }

        fetchRating();
    }, [activeTab, userId]);

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
                <h3>Rating: {rating ?? '–'}</h3>
                <RatingGraph userId={userId} format={formatMap[activeTab]} />
                <GameList userId={userId} format={formatMap[activeTab]} />
            </div>
        </div>
    );
}
