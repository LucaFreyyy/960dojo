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

function gameFinalFenFromPgn(pgnText) {
  if (!pgnText || !String(pgnText).trim()) return null;
  const startFen = extractPgnTag(pgnText, 'FEN') || 'start';
  try {
    const game = startFen === 'start' ? new Chess() : new Chess(startFen, { chess960: true });
    const sans = replaySansFromStoredPgn(pgnText, game.fen());
    for (let i = 0; i < sans.length; i += 1) {
      if (!game.move(sans[i], { sloppy: true })) break;
    }
    return game.fen();
  } catch {
    return null;
  }
}

function normalizeStoredPgn(pgnText) {
  if (typeof pgnText !== 'string') return null;
  const raw = pgnText.trim();
  if (!raw) return null;
  if (raw.includes('\\n')) return raw.replace(/\\n/g, '\n').replace(/\\r/g, '\r').trim();
  return raw;
}

function findFirstRatingAtOrAfter(ratings, playedAtIso) {
  if (!Array.isArray(ratings) || ratings.length === 0 || !playedAtIso) return null;
  const targetMs = Date.parse(playedAtIso);
  if (!Number.isFinite(targetMs)) return null;
  for (let i = 0; i < ratings.length; i += 1) {
    const entryMs = Date.parse(ratings[i]?.createdAt);
    if (!Number.isFinite(entryMs)) continue;
    if (entryMs >= targetMs) return Number(ratings[i]?.value) || null;
  }
  return null;
}

async function loadRatingHistoryByUser(supabase, gameRows, format) {
  const out = new Map();
  const rows = Array.isArray(gameRows) ? gameRows : [];
  const userIds = [
    ...new Set(
      rows
        .flatMap((r) => [r.whiteId, r.blackId])
        .filter(Boolean)
    ),
  ];
  if (!userIds.length) return out;

  const playedAtValues = rows.map((r) => Date.parse(r.playedAt)).filter((ms) => Number.isFinite(ms));
  if (!playedAtValues.length) return out;
  const minPlayedAtIso = new Date(Math.min(...playedAtValues)).toISOString();

  const { data: ratingRows } = await supabase
    .from('Rating')
    .select('userId, value, createdAt')
    .eq('type', format)
    .in('userId', userIds)
    .gte('createdAt', minPlayedAtIso)
    .order('createdAt', { ascending: true });

  for (const userId of userIds) out.set(userId, []);
  (ratingRows || []).forEach((row) => {
    if (!row?.userId) return;
    const list = out.get(row.userId) || [];
    list.push({ value: Number(row.value) || null, createdAt: row.createdAt });
    out.set(row.userId, list);
  });
  return out;
}

function buildGameItems(gameRows, userId, usersById, ratingHistoryByUser) {
  return (gameRows || []).map((r) => {
    const viewerColor = r.whiteId === userId ? 'white' : 'black';
    const opponentId = viewerColor === 'white' ? r.blackId : r.whiteId;
    const whiteAfter = findFirstRatingAtOrAfter(ratingHistoryByUser.get(r.whiteId), r.playedAt);
    const blackAfter = findFirstRatingAtOrAfter(ratingHistoryByUser.get(r.blackId), r.playedAt);
    const whiteBefore = Number(r.whiteRating) || null;
    const blackBefore = Number(r.blackRating) || null;
    return {
      kind: 'game',
      id: r.id,
      whiteId: r.whiteId,
      blackId: r.blackId,
      finished: r.playedAt,
      result: r.result,
      viewerColor,
      opponentId,
      opponentName: usersById.get(opponentId)?.name || null,
      analysisPgn: normalizeStoredPgn(r.pgn),
      lastFen: gameFinalFenFromPgn(r.pgn),
      whiteName: usersById.get(r.whiteId)?.name || null,
      blackName: usersById.get(r.blackId)?.name || null,
      whiteRatingBefore: whiteBefore,
      blackRatingBefore: blackBefore,
      whiteRatingAfter: whiteAfter,
      blackRatingAfter: blackAfter,
      whiteDelta: whiteBefore != null && whiteAfter != null ? whiteAfter - whiteBefore : null,
      blackDelta: blackBefore != null && blackAfter != null ? blackAfter - blackBefore : null,
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
  const skip = Math.max(0, parseInt(String(req.query.skip || '0'), 10) || 0);
  const take = Math.min(50, Math.max(1, parseInt(String(req.query.take || '5'), 10) || 5));
  const kindRaw = typeof req.query.kind === 'string' ? req.query.kind.trim().toLowerCase() : '';
  const kind = kindRaw === 'openings' ? 'openings' : kindRaw === 'tactics' ? 'tactics' : kindRaw === 'games' ? 'games' : null;
  const format = typeof req.query.format === 'string' ? req.query.format.trim().toLowerCase() : '';

  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (!kind) return res.status(400).json({ error: 'kind must be tactics, openings or games' });

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

  if (kind === 'games') {
    if (!format) return res.status(400).json({ error: 'format required for games' });
    const { data: gameRows, error: gErr } = await supabase
      .from('Game')
      .select('id, whiteId, blackId, whiteRating, blackRating, type, playedAt, pgn, result')
      .or(`whiteId.eq.${userId},blackId.eq.${userId}`)
      .eq('type', format)
      .order('playedAt', { ascending: false })
      .limit(pool);
    if (gErr) {
      console.error('[profile/activity] games', gErr);
      return res.status(500).json({ error: 'Failed to load activity' });
    }
    const allUserIds = [
      ...new Set(
        (gameRows || [])
          .flatMap((r) => [r.whiteId, r.blackId])
          .filter(Boolean)
      ),
    ];
    const usersById = new Map();
    if (allUserIds.length) {
      const { data: users } = await supabase.from('User').select('id, name').in('id', allUserIds);
      (users || []).forEach((u) => usersById.set(u.id, u));
    }
    const ratingHistoryByUser = await loadRatingHistoryByUser(supabase, gameRows || [], format);
    const merged = buildGameItems(gameRows, userId, usersById, ratingHistoryByUser);
    const page = merged.slice(skip, skip + take);
    const exhausted = !gameRows || gameRows.length < pool;
    const hasMore = page.length === take && (skip + take < merged.length || !exhausted);
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
