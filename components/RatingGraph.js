import { useEffect, useState, useId, useRef } from 'react';
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

/** Date only (no time) for axis, ticks, and tooltip. */
function formatDateOnly(ts) {
    if (ts == null || !Number.isFinite(ts)) return '';
    return new Date(ts).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function localDayKey(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** One sample per calendar day (local): last rating row of that day. Preserves that row's `t` for the x-axis. */
function downsampleDailyLast(rows) {
    if (!rows?.length) return [];
    const lastByDay = new Map();
    for (const row of rows) {
        if (row.t == null || !Number.isFinite(row.t)) continue;
        lastByDay.set(localDayKey(row.t), row);
    }
    return [...lastByDay.values()].sort((a, b) => a.t - b.t);
}

function getTimeBounds(rows) {
    if (!rows?.length) return { minT: 0, maxT: 0 };
    let minT = Infinity;
    let maxT = -Infinity;
    for (const d of rows) {
        if (d.t == null || !Number.isFinite(d.t)) continue;
        if (d.t < minT) minT = d.t;
        if (d.t > maxT) maxT = d.t;
    }
    if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return { minT: 0, maxT: 0 };
    return { minT, maxT };
}

/** Pad domain so a single point or endpoints are not flush against the chart edge. */
function paddedTimeDomain(minT, maxT) {
    if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return [0, 1];
    if (minT === maxT) {
        const halfDay = 43200000;
        return [minT - halfDay, maxT + halfDay];
    }
    const pad = (maxT - minT) * 0.04;
    return [minT - pad, maxT + pad];
}

/** ~evenly spaced tick timestamps between domain ends (calendar-linear axis). */
function evenTimeTicks(domainMin, domainMax, maxTicks = 7) {
    if (!Number.isFinite(domainMin) || !Number.isFinite(domainMax)) return [];
    let lo = domainMin;
    let hi = domainMax;
    if (hi < lo) [lo, hi] = [hi, lo];
    if (hi === lo) return [lo];
    const n = Math.max(2, Math.min(maxTicks, 8));
    const out = [];
    for (let k = 0; k < n; k += 1) {
        out.push(lo + ((hi - lo) * k) / (n - 1));
    }
    return [...new Set(out.map((x) => Math.round(x)))].sort((a, b) => a - b);
}

function maxFiniteKey(rows, key) {
    let best = -Infinity;
    for (const row of rows) {
        const v = row[key];
        if (v != null && Number.isFinite(v)) best = Math.max(best, v);
    }
    return best === -Infinity ? null : Math.round(best);
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
    for (const e of events) {
        if (e.user === 'a') lastA = e.value;
        else lastB = e.value;
        out.push({
            t: e.t,
            profileRating: lastA,
            viewerRating: lastB,
        });
    }
    return out;
}

/** Smoothed curve through points; monotoneX avoids step-like segments while staying sane for ratings. */
const AREA_CURVE = 'monotoneX';

export default function RatingGraph({
    userId,
    format,
    compareUserId,
    profileName,
    onChartMeta = null,
}) {
    const [data, setData] = useState([]);
    const [compareMode, setCompareMode] = useState(false);
    const fillProfileId = useId().replace(/:/g, '');
    const fillViewerId = useId().replace(/:/g, '');

    const profileLabel = profileName?.trim() || 'Player';
    const compareLabel = 'You';
    const onChartMetaRef = useRef(onChartMeta);
    onChartMetaRef.current = onChartMeta;
    const fetchGenRef = useRef(0);

    useEffect(() => {
        if (userId && format) {
            fetchRatingData();
        }
    }, [userId, format, compareUserId]);

    async function fetchRatingData() {
        const gen = ++fetchGenRef.current;
        const isStale = () => gen !== fetchGenRef.current;

        const meta = (payload) => {
            if (!isStale()) onChartMetaRef.current?.(payload);
        };

        const reportEmpty = () => {
            if (isStale()) return;
            meta({ profilePeak: null, viewerPeak: null });
            setData([]);
            setCompareMode(false);
        };

        const { data: ratings, error } = await supabase
            .from('Rating')
            .select('value, createdAt')
            .eq('userId', userId)
            .eq('type', format)
            .order('createdAt', { ascending: true });

        if (error || !ratings?.length) {
            reportEmpty();
            return;
        }

        if (!compareUserId || compareUserId === userId) {
            const full = ratings.map((r) => ({
                t: new Date(r.createdAt).getTime(),
                rating: r.value,
            }));
            const profilePeak = maxFiniteKey(full, 'rating');
            if (isStale()) return;
            meta({ profilePeak, viewerPeak: null });
            setData(downsampleDailyLast(full));
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
            const full = ratings.map((r) => ({
                t: new Date(r.createdAt).getTime(),
                rating: r.value,
            }));
            const profilePeak = maxFiniteKey(full, 'rating');
            if (isStale()) return;
            meta({ profilePeak, viewerPeak: null });
            setData(downsampleDailyLast(full));
            setCompareMode(false);
            return;
        }

        const merged = mergeRatingHistories(ratings, compareRatings || []);
        const profilePeak = maxFiniteKey(merged, 'profileRating');
        const viewerPeak = maxFiniteKey(merged, 'viewerRating');
        if (isStale()) return;
        meta({ profilePeak, viewerPeak });
        setData(downsampleDailyLast(merged));
        setCompareMode(true);
    }

    const hasCompareData = compareMode && data.some((d) => d.viewerRating != null);
    const hasProfileData = compareMode && data.some((d) => d.profileRating != null);

    const { minT, maxT } = getTimeBounds(data);
    const [xDomainMin, xDomainMax] = paddedTimeDomain(minT, maxT);
    const xTicks = data.length ? evenTimeTicks(xDomainMin, xDomainMax) : [];

    const tooltipLabelFormatter = (_, payload) => {
        const row = payload?.[0]?.payload;
        return row?.t != null ? formatDateOnly(row.t) : '';
    };

    const chartMargins = { top: 8, right: 8, left: -12, bottom: 6 };
    const xAxisCommon = {
        dataKey: 't',
        type: 'number',
        domain: [xDomainMin, xDomainMax],
        ticks: xTicks,
        tickFormatter: formatDateOnly,
        tick: { fill: '#93a3bf', fontSize: 10 },
        axisLine: { stroke: '#334155' },
        tickLine: { stroke: '#334155' },
        angle: -32,
        textAnchor: 'end',
        height: 56,
        interval: 0,
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
                <ResponsiveContainer width="100%" height={268}>
                    {compareMode ? (
                        <AreaChart data={data} margin={chartMargins}>
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
                            <XAxis {...xAxisCommon} />
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
                                    type={AREA_CURVE}
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
                                    type={AREA_CURVE}
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
                        <AreaChart data={data} margin={chartMargins}>
                            <defs>
                                <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
                                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.06} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 6" stroke="#1f2937" />
                            <XAxis {...xAxisCommon} />
                            <YAxis
                                domain={['dataMin - 60', 'dataMax + 60']}
                                tick={{ fill: '#93a3bf', fontSize: 11 }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                width={44}
                            />
                            <Tooltip labelFormatter={tooltipLabelFormatter} />
                            <Area
                                type={AREA_CURVE}
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
