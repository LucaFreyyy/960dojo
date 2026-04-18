import { useEffect, useState, useId } from 'react';
import { supabase } from '../lib/supabase';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';

const axisTickTime = (ts) => new Date(ts).toLocaleDateString();
const tooltipTime = (ts) => new Date(ts).toLocaleString();

/** ~evenly spaced tick indices for the X axis (event index, not calendar time). */
function evenTickIndices(len, maxTicks = 7) {
    if (len <= 0) return [];
    if (len === 1) return [0];
    const last = len - 1;
    if (last < maxTicks) {
        return Array.from({ length: len }, (_, i) => i);
    }
    const out = [0];
    const step = last / (maxTicks - 1);
    for (let k = 1; k < maxTicks - 1; k += 1) {
        out.push(Math.round(k * step));
    }
    out.push(last);
    return [...new Set(out)].sort((a, b) => a - b);
}

function mergeRatingHistories(rowsA, rowsB) {
    const a = (rowsA || []).map((r) => ({
        t: new Date(r.createdAt).getTime(),
        user: 'a',
        value: r.value,
    }));
    const b = (rowsB || []).map((r) => ({
        t: new Date(r.createdAt).getTime(),
        user: 'b',
        value: r.value,
    }));
    const events = [...a, ...b].sort((x, y) => x.t - y.t);
    let lastA = null;
    let lastB = null;
    const out = [];
    let idx = 0;
    for (const e of events) {
        if (e.user === 'a') lastA = e.value;
        else lastB = e.value;
        out.push({
            idx: idx++,
            t: e.t,
            profileRating: lastA,
            viewerRating: lastB,
        });
    }
    return out;
}

export default function RatingGraph({ userId, format, compareUserId, profileName }) {
    const [data, setData] = useState([]);
    const [compareMode, setCompareMode] = useState(false);
    const fillProfileId = useId().replace(/:/g, '');
    const fillViewerId = useId().replace(/:/g, '');

    const profileLabel = profileName?.trim() || 'Player';
    const compareLabel = 'You';

    useEffect(() => {
        if (userId && format) {
            fetchRatingData();
        }
    }, [userId, format, compareUserId]);

    async function fetchRatingData() {
        const { data: ratings, error } = await supabase
            .from('Rating')
            .select('value, createdAt')
            .eq('userId', userId)
            .eq('type', format)
            .order('createdAt', { ascending: true });

        if (error || !ratings) {
            setData([]);
            setCompareMode(false);
            return;
        }

        if (!compareUserId || compareUserId === userId) {
            const chartData = ratings.map((r, i) => ({
                idx: i,
                t: new Date(r.createdAt).getTime(),
                rating: r.value,
            }));
            setData(chartData);
            setCompareMode(false);
            return;
        }

        const { data: compareRatings, error: compareErr } = await supabase
            .from('Rating')
            .select('value, createdAt')
            .eq('userId', compareUserId)
            .eq('type', format)
            .order('createdAt', { ascending: true });

        if (compareErr) {
            const chartData = ratings.map((r, i) => ({
                idx: i,
                t: new Date(r.createdAt).getTime(),
                rating: r.value,
            }));
            setData(chartData);
            setCompareMode(false);
            return;
        }

        const merged = mergeRatingHistories(ratings, compareRatings || []);
        setData(merged);
        setCompareMode(true);
    }

    const hasCompareData = compareMode && data.some((d) => d.viewerRating != null);
    const hasProfileData = compareMode && data.some((d) => d.profileRating != null);
    const xMax = Math.max(0, data.length - 1);
    const xTicks = evenTickIndices(data.length);

    const xTickFormatter = (i) => {
        const row = data[Math.round(i)];
        return row?.t != null ? axisTickTime(row.t) : '';
    };

    const tooltipLabelFormatter = (_, payload) => {
        const row = payload?.[0]?.payload;
        return row?.t != null ? tooltipTime(row.t) : '';
    };

    return (
        <div className="rating-graph-container">
            <h3>Rating Trend</h3>
            {compareMode ? (
                <p className="rating-graph-compare-caption">
                    {profileLabel} vs. {compareLabel}
                </p>
            ) : null}
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                    {compareMode ? (
                        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                            <defs>
                                <linearGradient id={fillProfileId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
                                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.06} />
                                </linearGradient>
                                <linearGradient id={fillViewerId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.42} />
                                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.06} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 6" stroke="#1f2937" />
                            <XAxis
                                dataKey="idx"
                                type="number"
                                domain={[0, xMax]}
                                ticks={xTicks}
                                allowDecimals={false}
                                hide={data.length > 16}
                                tick={{ fill: '#93a3bf', fontSize: 11 }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                tickFormatter={xTickFormatter}
                            />
                            <YAxis
                                domain={['dataMin - 60', 'dataMax + 60']}
                                tick={{ fill: '#93a3bf', fontSize: 11 }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                width={44}
                            />
                            <Tooltip labelFormatter={tooltipLabelFormatter} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {hasProfileData ? (
                                <Area
                                    type="monotone"
                                    dataKey="profileRating"
                                    name={profileLabel}
                                    stroke="#60a5fa"
                                    strokeWidth={2.2}
                                    fill={`url(#${fillProfileId})`}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 3.5, stroke: '#93c5fd', strokeWidth: 1, fill: '#0f172a' }}
                                />
                            ) : null}
                            {hasCompareData ? (
                                <Area
                                    type="monotone"
                                    dataKey="viewerRating"
                                    name={compareLabel}
                                    stroke="#f59e0b"
                                    strokeWidth={2.2}
                                    fill={`url(#${fillViewerId})`}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 3.5, stroke: '#fcd34d', strokeWidth: 1, fill: '#0f172a' }}
                                />
                            ) : null}
                        </AreaChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                            <defs>
                                <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
                                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.06} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 6" stroke="#1f2937" />
                            <XAxis
                                dataKey="idx"
                                type="number"
                                domain={[0, xMax]}
                                ticks={xTicks}
                                allowDecimals={false}
                                hide={data.length > 16}
                                tick={{ fill: '#93a3bf', fontSize: 11 }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                tickFormatter={xTickFormatter}
                            />
                            <YAxis
                                domain={['dataMin - 60', 'dataMax + 60']}
                                tick={{ fill: '#93a3bf', fontSize: 11 }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                width={44}
                            />
                            <Tooltip labelFormatter={tooltipLabelFormatter} />
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
                    )}
                </ResponsiveContainer>
            ) : (
                <p>No rating data available yet.</p>
            )}
        </div>
    );
}
