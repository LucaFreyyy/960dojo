import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    AreaChart,
    Area,
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
        const { data: ratings, error } = await supabase
            .from('Rating')
            .select('value, createdAt')
            .eq('userId', userId)
            .eq('type', format)
            .order('createdAt', { ascending: true });

        if (!error && ratings) {
            const chartData = ratings.map(r => ({
                date: new Date(r.createdAt).toLocaleDateString(),
                rating: r.value,
            }));
            setData(chartData);
        }
    }

    return (
        <div className="rating-graph-container">
            <h3>Rating Trend</h3>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                        <defs>
                            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.06} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" stroke="#1f2937" />
                        <XAxis
                            dataKey="date"
                            hide={data.length > 16}
                            tick={{ fill: '#93a3bf', fontSize: 11 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                        />
                        <YAxis
                            domain={['dataMin - 60', 'dataMax + 60']}
                            tick={{ fill: '#93a3bf', fontSize: 11 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                            width={44}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: 10,
                                color: '#e2e8f0',
                            }}
                            labelStyle={{ color: '#93c5fd', fontWeight: 700 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rating"
                            stroke="#60a5fa"
                            strokeWidth={2.2}
                            fill="url(#ratingFill)"
                            dot={false}
                            activeDot={{ r: 3.5, stroke: '#93c5fd', strokeWidth: 1, fill: '#0f172a' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <p>No rating data available yet.</p>
            )}
        </div>
    );
}
