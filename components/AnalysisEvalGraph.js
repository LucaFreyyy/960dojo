import { useMemo, useCallback, useId } from 'react';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    CartesianGrid,
    Layer,
} from 'recharts';
import { usePlotArea, useYAxis } from 'recharts/es6/hooks';
import { formatEval } from '../lib/evalDisplay';

const CURVE = 'monotoneX';

const Y_MIN_HALF_SPAN = 2;
const CLIP_NORMAL = 6;
const MATE_EXTRA = 5;

/**
 * Map stored eval (pawns, white POV; mate if |v| > 100) to a single Y for line + areas.
 */
function rawPawnsToGraphY(rawPawns) {
    if (!Number.isFinite(rawPawns)) return null;
    if (Math.abs(rawPawns) > 100) {
        const sign = rawPawns > 0 ? 1 : -1;
        const m = Math.max(1, Math.round(Math.abs(rawPawns) - 100));
        return sign * (CLIP_NORMAL + MATE_EXTRA / m);
    }
    const v = Math.max(-CLIP_NORMAL, Math.min(CLIP_NORMAL, rawPawns));
    return v;
}

function buildMainlineEvalSeries(mainline, evalByKey) {
    const len = Array.isArray(mainline) ? mainline.length : 0;
    const rows = [];
    const keys = ['main:initial', ...Array.from({ length: len }, (_, i) => `main:${i}`)];
    for (let xi = 0; xi < keys.length; xi += 1) {
        const key = keys[xi];
        const raw = evalByKey?.get?.(key);
        const y = Number.isFinite(raw) ? rawPawnsToGraphY(raw) : null;
        if (!Number.isFinite(y)) {
            rows.push({
                x: xi,
                key,
                eval: null,
                rawEval: Number.isFinite(raw) ? raw : null,
            });
        } else {
            rows.push({
                x: xi,
                key,
                eval: y,
                rawEval: raw,
            });
        }
    }
    return rows;
}

function formatMainlineMoveLabel(mainline, chartX) {
    if (!Number.isInteger(chartX) || chartX < 1) return null;
    const moveIndex = chartX - 1;
    const node = Array.isArray(mainline) ? mainline[moveIndex] : null;
    if (!node?.san) return null;
    const san = String(node.san).trim().replace(/[!?]+$/, '');
    if (!san) return null;
    const moveNo = Math.floor(moveIndex / 2) + 1;
    return moveIndex % 2 === 0 ? `${moveNo}. ${san}` : `${moveNo}... ${san}`;
}

function symmetricYScale(rows) {
    const ys = rows.map((r) => r.eval).filter((v) => Number.isFinite(v));
    if (!ys.length) {
        const M = Y_MIN_HALF_SPAN;
        const ticks = [];
        for (let t = -M; t <= M; t += 1) ticks.push(t);
        return { domain: [-M, M], ticks };
    }
    const maxAbs = Math.max(...ys.map((y) => Math.abs(y)));
    const M = Math.max(Y_MIN_HALF_SPAN, Math.ceil(maxAbs));
    const ticks = [];
    for (let t = -M; t <= M; t += 1) ticks.push(t);
    return { domain: [-M, M], ticks };
}

const TOOLTIP_SHELL_STYLE = {
    background: 'var(--bg-deep, #0f172a)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: '8px',
    color: 'var(--ink, #e2e8f0)',
    padding: '8px 10px',
    fontSize: '0.85rem',
};

function EvalTooltipBody({ x, row, mainline }) {
    if (!Number.isInteger(x) || x < 0 || !row) return null;
    const hasEval = row.rawEval != null && Number.isFinite(row.rawEval);
    const evalText = hasEval ? formatEval(row.rawEval) : '—';
    const moveLabel = x >= 1 ? formatMainlineMoveLabel(mainline, x) : null;

    if (x === 0) {
        if (!hasEval) {
            return (
                <div style={TOOLTIP_SHELL_STYLE}>
                    <span style={{ color: 'var(--ink-muted, #94a3b8)' }}>No eval</span>
                </div>
            );
        }
        return (
            <div style={TOOLTIP_SHELL_STYLE}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evalText}</span>
            </div>
        );
    }

    return (
        <div style={TOOLTIP_SHELL_STYLE}>
            {moveLabel ? (
                <div style={{ color: 'var(--gold, #d4af37)', fontWeight: 700, marginBottom: 4 }}>{moveLabel}</div>
            ) : null}
            <div>
                <span style={{ color: 'var(--ink-muted, #94a3b8)' }}>Eval </span>
                <span style={{ fontWeight: 700 }}>{evalText}</span>
            </div>
        </div>
    );
}

function CustomEvalTooltip({ active, payload, mainline, chartRows }) {
    if (!active || !payload?.length) return null;
    const x = payload[0]?.payload?.x;
    if (!Number.isInteger(x) || x < 0) return null;
    const row = chartRows[x];
    return <EvalTooltipBody x={x} row={row} mainline={mainline} />;
}

function extractChartXFromPointerState(state, chartData) {
    if (!state || !Array.isArray(chartData) || chartData.length === 0) return null;
    const label = state.activeLabel;
    if (typeof label === 'number' && Number.isFinite(label)) {
        const xi = Math.round(label);
        if (xi >= 0 && xi <= chartData[chartData.length - 1].x) return xi;
    }
    const idx = state.activeTooltipIndex;
    if (Number.isInteger(idx) && idx >= 0 && idx < chartData.length) {
        const row = chartData[idx];
        if (row && Number.isInteger(row.x)) return row.x;
    }
    return null;
}

function mainlineSelectionToChartX(selectedPosition) {
    if (!selectedPosition) return null;
    const path = Array.isArray(selectedPosition.variationPath) ? selectedPosition.variationPath : [];
    if (path.length > 0) return null;
    const idx = Number.isInteger(selectedPosition.index) ? selectedPosition.index : -1;
    if (idx < -1) return null;
    return idx + 1;
}

/**
 * Two <Area dataKey="eval" /> layers share the same monotone curve; clip each to one side of y=0
 * in screen space so fills match the line (unlike separate pos/neg series).
 */
function EvalSplitFillAreas({ clipUid, yDomain }) {
    const plot = usePlotArea();
    const yAxis = useYAxis(0);
    if (!plot?.width || !yAxis?.scale || !Array.isArray(yDomain) || yDomain.length < 2) {
        return null;
    }
    const scale = yAxis.scale;
    const y0 = scale(0);
    if (!Number.isFinite(y0)) return null;

    const yHi = scale(yDomain[1]);
    const posAboveZeroLine = Number.isFinite(yHi) && yHi < y0;

    const left = plot.x;
    const top = plot.y;
    const w = plot.width;
    const bottom = plot.y + plot.height;
    const split = Math.min(Math.max(y0, top), bottom);

    const whiteRect = posAboveZeroLine
        ? { x: left, y: top, width: w, height: Math.max(0, split - top) }
        : { x: left, y: split, width: w, height: Math.max(0, bottom - split) };
    const blackRect = posAboveZeroLine
        ? { x: left, y: split, width: w, height: Math.max(0, bottom - split) }
        : { x: left, y: top, width: w, height: Math.max(0, split - top) };

    const areaCommon = {
        type: CURVE,
        dataKey: 'eval',
        baseValue: 0,
        stroke: 'none',
        connectNulls: false,
        isAnimationActive: false,
        legendType: 'none',
        dot: false,
        activeDot: false,
    };

    return (
        <>
            <defs>
                <clipPath id={`anlz-ev-w-${clipUid}`} clipPathUnits="userSpaceOnUse">
                    <rect x={whiteRect.x} y={whiteRect.y} width={whiteRect.width} height={whiteRect.height} />
                </clipPath>
                <clipPath id={`anlz-ev-b-${clipUid}`} clipPathUnits="userSpaceOnUse">
                    <rect x={blackRect.x} y={blackRect.y} width={blackRect.width} height={blackRect.height} />
                </clipPath>
            </defs>
            <Layer clipPath={`url(#anlz-ev-w-${clipUid})`}>
                <Area {...areaCommon} fill="#ffffff" name="__w" />
            </Layer>
            <Layer clipPath={`url(#anlz-ev-b-${clipUid})`}>
                <Area {...areaCommon} fill="#0a0a0a" name="__b" />
            </Layer>
        </>
    );
}

export default function AnalysisEvalGraph({
    mainline,
    evalByKey,
    selectedPosition,
    onBrowsePositionChanged,
}) {
    const clipUid = useId().replace(/:/g, '');

    const data = useMemo(
        () => buildMainlineEvalSeries(mainline, evalByKey),
        [mainline, evalByKey]
    );

    const hasAnyEval = useMemo(() => data.some((r) => Number.isFinite(r.eval)), [data]);
    const { domain: yDomain, ticks: yTicks } = useMemo(() => symmetricYScale(data), [data]);
    const xMax = Math.max(0, data.length - 1);
    const xDomain = useMemo(() => {
        if (xMax <= 0) return [0, 1];
        return [0, xMax + 0.02];
    }, [xMax]);

    /** Main-line browse index only; variations do not map to this chart. */
    const browseChartX = useMemo(() => {
        const cx = mainlineSelectionToChartX(selectedPosition);
        if (cx == null || cx < 0 || cx > xMax) return null;
        return cx;
    }, [selectedPosition, xMax]);

    /** Remount chart when browse position changes so tooltip/cursor state does not stick to the mouse X. */
    const chartBrowseKey = useMemo(() => {
        const p = selectedPosition || {};
        const idx = Number.isInteger(p.index) ? p.index : -1;
        const path = Array.isArray(p.variationPath) ? p.variationPath.join('|') : '';
        return `${idx}|${path}`;
    }, [selectedPosition]);

    const handleChartClick = useCallback(
        (state, reactEvent) => {
            if (typeof onBrowsePositionChanged !== 'function') return;
            const t = reactEvent?.target;
            if (!t || typeof t.closest !== 'function' || !t.closest('.recharts-wrapper')) return;
            const chartX = extractChartXFromPointerState(state, data);
            if (!Number.isInteger(chartX)) return;
            if (chartX < 0 || chartX > xMax) return;
            onBrowsePositionChanged(chartX - 1, []);
        },
        [data, onBrowsePositionChanged, xMax]
    );

    if (!hasAnyEval) {
        return (
            <div className="analysis-eval-graph analysis-eval-graph--empty">
                <div className="analysis-eval-graph__title">Main line evaluation</div>
                <p className="analysis-eval-graph__empty">No engine evaluations on the main line yet.</p>
            </div>
        );
    }

    return (
        <div className="analysis-eval-graph">
            <div className="analysis-eval-graph__title">Main line evaluation</div>
            <div className="analysis-eval-graph__chart">
                <div
                    className={
                        typeof onBrowsePositionChanged === 'function'
                            ? 'analysis-eval-graph__chart-fill analysis-eval-graph__chart-fill--clickable'
                            : 'analysis-eval-graph__chart-fill'
                    }
                >
                    <ResponsiveContainer width="100%" height="100%" debounce={32}>
                        <ComposedChart
                            key={chartBrowseKey}
                            data={data}
                            margin={{ top: 12, right: 20, left: 2, bottom: 4 }}
                            onClick={handleChartClick}
                        >
                            <CartesianGrid
                                strokeDasharray="6 12"
                                stroke="rgba(148, 163, 184, 0.22)"
                                strokeWidth={1.1}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={xDomain}
                                tick={false}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.5 }}
                                allowDecimals={false}
                            />
                            <YAxis
                                domain={yDomain}
                                ticks={yTicks}
                                allowDecimals={false}
                                width={52}
                                tick={{ fill: '#94a3b8', fontSize: 13 }}
                                axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.5 }}
                                tickLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.5 }}
                                tickMargin={8}
                                tickFormatter={(v) => (Number.isFinite(v) ? String(Math.round(v)) : '')}
                            />
                            <Tooltip
                                allowEscapeViewBox={{ x: true, y: true }}
                                cursor={false}
                                content={(props) => (
                                    <CustomEvalTooltip
                                        {...props}
                                        mainline={mainline}
                                        chartRows={data}
                                    />
                                )}
                                isAnimationActive={false}
                            />
                            <EvalSplitFillAreas clipUid={clipUid} yDomain={yDomain} />
                            <ReferenceLine
                                y={0}
                                stroke="rgba(212, 175, 55, 0.95)"
                                strokeWidth={3}
                                strokeDasharray="8 6"
                                ifOverflow="extendDomain"
                            />
                            {browseChartX != null ? (
                                <ReferenceLine
                                    x={browseChartX}
                                    stroke="rgba(212, 175, 55, 0.55)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    ifOverflow="extendDomain"
                                />
                            ) : null}
                            <Line
                                type={CURVE}
                                dataKey="eval"
                                stroke="#64748b"
                                strokeWidth={3.5}
                                dot={false}
                                activeDot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
