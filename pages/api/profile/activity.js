import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { positionNrToStartFen } from '../../../lib/chess960';
import { replaySansFromStoredPgn } from '../../../lib/openingsPgn';
import { Chess } from '../../../lib/chessCompat';
import { extractPgnTag } from '../../../lib/tacticPgnUtils';
import { buildOpeningAnalysisPgn } from '../../../lib/openingAnalysisPgn';

function openingLastFen(openingNr, pgnText) {
  try {
    const start = positionNrToStartFen(openingNr);
    const sans = replaySansFromStoredPgn(pgnText || '', start);
    const g = new Chess(start, { chess960: true });
    for (let i = 0; i < sans.length; i += 1) {
      if (!g.move(sans[i], { sloppy: true })) break;
    }
    return g.fen();
  } catch {
    try {
      return positionNrToStartFen(openingNr);
    } catch {
      return null;
    }
  }
}

/** Last entry is final-position eval (centipawns, white POV); see openings finalize flow. */
function finalEvalCpFromHistory(evalHistory) {
  if (!Array.isArray(evalHistory) || evalHistory.length === 0) return null;
  const last = evalHistory[evalHistory.length - 1];
  if (!Number.isFinite(last)) return null;
  return last;
}

function buildTacticItems(tacticRows, fenByTacticId, pgnByTacticId) {
  return (tacticRows || []).map((r) => ({
    kind: 'tactic',
    id: r.id,
    finished: r.finished,
    solved: r.solved,
    tacticId: r.tacticId,
    startFen: fenByTacticId.get(r.tacticId) ?? null,
    analysisPgn: pgnByTacticId.get(r.tacticId) ?? null,
  }));
}

function buildOpeningItems(openingRows) {
  return (openingRows || []).map((r) => {
    const startFen = (() => {
      try {
        return positionNrToStartFen(r.openingNr);
      } catch {
        return null;
      }
    })();
    return {
      kind: 'opening',
      id: r.id,
      finished: r.finished,
      openingNr: r.openingNr,
      color: r.color,
      startFen,
      lastFen: openingLastFen(r.openingNr, r.pgn),
      analysisPgn: buildOpeningAnalysisPgn(r.openingNr, r.pgn),
      finalEvalCpWhite: finalEvalCpFromHistory(r.evalHistory),
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
  const skip = Math.max(0, parseInt(String(req.query.skip || '0'), 10) || 0);
  const take = Math.min(50, Math.max(1, parseInt(String(req.query.take || '5'), 10) || 5));
  const kindRaw = typeof req.query.kind === 'string' ? req.query.kind.trim().toLowerCase() : '';
  const kind = kindRaw === 'openings' ? 'openings' : kindRaw === 'tactics' ? 'tactics' : null;

  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (!kind) return res.status(400).json({ error: 'kind must be tactics or openings' });

  const pool = Math.min(4000, skip + take + 250);

  let supabase;
  try {
    supabase = createSupabaseAdmin();
  } catch (e) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (kind === 'tactics') {
    const { data: tacticRows, error: tErr } = await supabase
      .from('UserTactic')
      .select('id, finished, solved, tacticId')
      .eq('userId', userId)
      .not('finished', 'is', null)
      .order('finished', { ascending: false })
      .limit(pool);

    if (tErr) {
      console.error('[profile/activity] tactics', tErr);
      return res.status(500).json({ error: 'Failed to load activity' });
    }

    const tacticIds = [...new Set((tacticRows || []).map((r) => r.tacticId).filter((x) => x != null))];
    const fenByTacticId = new Map();
    const pgnByTacticId = new Map();
    if (tacticIds.length > 0) {
      const { data: trows, error: tfenErr } = await supabase.from('Tactic').select('id, pgn').in('id', tacticIds);
      if (tfenErr) {
        console.error('[profile/activity] Tactic pgn', tfenErr);
        return res.status(500).json({ error: 'Failed to load activity' });
      }
      (trows || []).forEach((t) => {
        const fen = extractPgnTag(t.pgn, 'FEN');
        if (fen) fenByTacticId.set(t.id, fen);
        if (typeof t.pgn === 'string' && t.pgn.trim()) pgnByTacticId.set(t.id, t.pgn.trim());
      });
    }

    const merged = buildTacticItems(tacticRows, fenByTacticId, pgnByTacticId);
    const page = merged.slice(skip, skip + take);
    const exhausted = !tacticRows || tacticRows.length < pool;
    const hasMore =
      page.length === take && (skip + take < merged.length || !exhausted);

    return res.status(200).json({ items: page, hasMore });
  }

  const { data: openingRows, error: oErr } = await supabase
    .from('UserOpening')
    .select('id, finished, openingNr, color, pgn, evalHistory')
    .eq('userId', userId)
    .not('finished', 'is', null)
    .order('finished', { ascending: false })
    .limit(pool);

  if (oErr) {
    console.error('[profile/activity] openings', oErr);
    return res.status(500).json({ error: 'Failed to load activity' });
  }

  const merged = buildOpeningItems(openingRows);
  const page = merged.slice(skip, skip + take);
  const exhausted = !openingRows || openingRows.length < pool;
  const hasMore = page.length === take && (skip + take < merged.length || !exhausted);

  return res.status(200).json({ items: page, hasMore });
}
