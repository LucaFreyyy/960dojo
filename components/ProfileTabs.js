import { useState, useEffect } from 'react';
import RatingGraph from './RatingGraph';
import GameList from './GameList';

const formats = ['Bullet', 'Blitz', 'Rapid', 'Classical', 'Tactics', 'Openings'];

export default function ProfileTabs({ userId }) {
    const [activeTab, setActiveTab] = useState('Bullet');
    const [rating, setRating] = useState(null);

    useEffect(() => {
        // TODO: fetch current rating per format
        setRating(1200); // dummy
    }, [activeTab]);

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
                <h3>{activeTab} Rating: {rating}</h3>
                <RatingGraph userId={userId} format={activeTab} />
                <GameList userId={userId} format={activeTab} />
            </div>
        </div>
    );
}
