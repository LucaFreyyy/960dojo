import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

export default function RatingGraph({ userId, format }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (userId && format) {
            fetchRatingData();
        }
    }, [userId, format]);

    async function fetchRatingData() {
        const { data: games, error } = await supabase
            .from('Game')
            .select('rating, created_at')
            .eq('user_id', userId)
            .eq('format', format)
            .order('created_at', { ascending: true });

        if (!error && games) {
            const chartData = games.map(game => ({
                date: new Date(game.created_at).toLocaleDateString(),
                rating: game.rating,
            }));
            setData(chartData);
        }
    }

    return (
        <div className="rating-graph-container">
            <h3>{format} Rating Over Time</h3>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide={data.length > 20} />
                        <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="#2ea4ff" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p>No rating data available yet.</p>
            )}
        </div>
    );
}