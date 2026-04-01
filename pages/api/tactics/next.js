import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractPgnTag(pgn, tag) {
  if (typeof pgn !== 'string') return null;
  const re = new RegExp(`^\\[${tag} "([^"]*)"\\]$`, 'm');
  const m = pgn.match(re);
  return m?.[1] || null;
}

function parseSanMovesFromPgn(pgn) {
  if (typeof pgn !== 'string') return [];
  const body = pgn
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const out = [];
  for (const token of body.split(' ')) {
    if (!token) continue;
    if (/^\d+\.(\.\.)?$/.test(token) || /^\d+\.\.\.$/.test(token)) continue;
    const cleaned = token
      .replace(/^\d+\.(\.\.)?/, '')
      .replace(/^\d+\.\.\./, '')
      .replace(/[?!]+/g, '')
      .trim();
    if (cleaned) out.push(cleaned);
  }
  return out;
}

function extractPuzzleStartPlyFromPgn(pgn) {
  if (typeof pgn !== 'string') return null;
  const body = pgn
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .trim();
  const m = body.match(/(\d+)\.(\.\.)?/);
  if (!m) return null;
  const fullmove = Number(m[1]);
  if (!Number.isFinite(fullmove) || fullmove < 1) return null;
  const isBlackMove = m[2] === '..';
  // 1-based halfmove index at puzzle start.
  return isBlackMove ? (2 * (fullmove - 1) + 2) : (2 * (fullmove - 1) + 1);
}

function parseDifficulty(difficulty) {
  if (difficulty === 'easy') return { min: -300, max: -100 };
  if (difficulty === 'hard') return { min: 100, max: 300 };
  return { min: -100, max: 100 };
}

function inDifficultyBand(tacticRating, userRating, difficulty) {
  const { min, max } = parseDifficulty(difficulty);
  return tacticRating >= userRating + min && tacticRating <= userRating + max;
}

function inAnyBand(tacticRating, userRating) {
  return (
    inDifficultyBand(tacticRating, userRating, 'easy')
    || inDifficultyBand(tacticRating, userRating, 'middle')
    || inDifficultyBand(tacticRating, userRating, 'hard')
  );
}

async function chooseNewTactic({ userRating, difficulty, finishedIds, unfinishedIds }) {
  const { min, max } = parseDifficulty(difficulty);
  const minRating = userRating + min;
  const maxRating = userRating + max;

  const { data: inBand, error: inBandErr } = await supabaseAdmin
    .from('Tactic')
    .select('id, rating, pgn, numTimesPlayed, disLikes')
    .gte('rating', minRating)
    .lte('rating', maxRating);
  if (inBandErr) throw new Error(inBandErr.message);

  const freshInBand = (inBand || []).filter((t) => !finishedIds.has(t.id) && !unfinishedIds.has(t.id));
  if (freshInBand.length) {
    return { tactic: freshInBand[Math.floor(Math.random() * freshInBand.length)], usedFallback: false };
  }

  // Fallback: closest non-finished, non-unfinished puzzle.
  const { data: allTactics, error: allErr } = await supabaseAdmin
    .from('Tactic')
    .select('id, rating, pgn, numTimesPlayed, disLikes');
  if (allErr) throw new Error(allErr.message);

  const candidates = (allTactics || []).filter((t) => !finishedIds.has(t.id) && !unfinishedIds.has(t.id));
  if (!candidates.length) return { tactic: null, usedFallback: false };
  const closest = candidates
    .map((t) => ({ t, diff: Math.abs((t.rating ?? 1500) - userRating) }))
    .sort((a, b) => a.diff - b.diff)[0].t;
  return { tactic: closest, usedFallback: true };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { userId, difficulty = 'middle' } = req.query || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data: ratingRow, error: ratingErr } = await supabaseAdmin
      .from('Rating')
      .select('value')
      .eq('userId', userId)
      .eq('type', 'tactics')
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ratingErr) return res.status(500).json({ error: ratingErr.message });
    const userRating = ratingRow?.value ?? 1500;

    const { data: finishedRows, error: finishedErr } = await supabaseAdmin
      .from('UserTactic')
      .select('tacticId')
      .eq('userId', userId)
      .not('finished', 'is', null);
    if (finishedErr) return res.status(500).json({ error: finishedErr.message });
    const finishedIds = new Set((finishedRows || []).map((r) => r.tacticId));
    const userFinishedCount = (finishedRows || []).length;

    const { data: userRows, error: userRowsErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id, tacticId, finished, solved')
      .eq('userId', userId);
    if (userRowsErr) return res.status(500).json({ error: userRowsErr.message });

    const { count: failedFinishedCount, error: failedCountErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userId)
      .not('finished', 'is', null)
      .eq('solved', false);
    if (failedCountErr) return res.status(500).json({ error: failedCountErr.message });

    if (
      (failedFinishedCount || 0) > 20
      && Math.random() < 1 / 3
    ) {
      const { data: oldestFailedRow, error: oldestErr } = await supabaseAdmin
        .from('UserTactic')
        .select('id, tacticId')
        .eq('userId', userId)
        .not('finished', 'is', null)
        .eq('solved', false)
        .order('finished', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (oldestErr) return res.status(500).json({ error: oldestErr.message });

      if (oldestFailedRow?.tacticId != null) {
        const { data: retryTactic, error: retryTacticErr } = await supabaseAdmin
          .from('Tactic')
          .select('id, rating, pgn, numTimesPlayed, disLikes')
          .eq('id', oldestFailedRow.tacticId)
          .maybeSingle();
        if (retryTacticErr) return res.status(500).json({ error: retryTacticErr.message });

        if (retryTactic) {
          const chosen = retryTactic;
          const startFen = extractPgnTag(chosen.pgn, 'FEN');
          const puzzleLine = parseSanMovesFromPgn(chosen.pgn);
          const puzzleStartPly = extractPuzzleStartPlyFromPgn(chosen.pgn);
          if (!startFen || !puzzleLine.length) {
            return res.status(500).json({ error: 'Invalid tactic PGN: missing FEN tag or moves' });
          }

          const unfinishedForTrim = (userRows || []).filter((r) => !r.finished);
          if (unfinishedForTrim.length >= 3) {
            const { error: rmErr } = await supabaseAdmin
              .from('UserTactic')
              .delete()
              .eq('id', unfinishedForTrim[0].id);
            if (rmErr) return res.status(500).json({ error: rmErr.message });
          }

          const { error: reopenErr } = await supabaseAdmin
            .from('UserTactic')
            .update({ finished: null, solved: false })
            .eq('id', oldestFailedRow.id);
          if (reopenErr) return res.status(500).json({ error: reopenErr.message });

          return res.status(200).json({
            tactic: {
              id: chosen.id,
              rating: chosen.rating,
              pgn: chosen.pgn,
              numTimesPlayed: chosen.numTimesPlayed,
              disLikes: chosen.disLikes,
              startFen,
              puzzleLine,
              linkToGame: extractPgnTag(chosen.pgn, 'Site'),
              puzzleStartPly,
            },
            userRating,
            userFinishedCount,
            tacticTimesPlayed: Number.isFinite(chosen?.numTimesPlayed) ? chosen.numTimesPlayed : 0,
            infoMessage: 'Retrying your oldest missed puzzle.',
          });
        }
      }
    }

    const unfinishedRows = (userRows || []).filter((r) => !r.finished);
    const unfinishedIds = unfinishedRows.map((r) => r.tacticId);

    let unfinishedTactics = [];
    if (unfinishedIds.length) {
      const { data: unfinishedTacticsRows, error: unfinishedTacticsErr } = await supabaseAdmin
        .from('Tactic')
        .select('id, rating, pgn, numTimesPlayed, disLikes')
        .in('id', unfinishedIds);
      if (unfinishedTacticsErr) return res.status(500).json({ error: unfinishedTacticsErr.message });
      unfinishedTactics = unfinishedTacticsRows || [];
    }

    const tacticById = new Map(unfinishedTactics.map((t) => [t.id, t]));
    let activeUnfinished = unfinishedRows
      .map((r) => ({ rowId: r.id, tactic: tacticById.get(r.tacticId) }))
      .filter((x) => x.tactic);

    // Drop stale unfinished puzzles that no longer fit any difficulty band.
    const stale = activeUnfinished.filter((x) => !inAnyBand(x.tactic.rating ?? 1500, userRating));
    if (stale.length) {
      const staleRowIds = stale.map((x) => x.rowId);
      const { error: staleDeleteErr } = await supabaseAdmin.from('UserTactic').delete().in('id', staleRowIds);
      if (staleDeleteErr) return res.status(500).json({ error: staleDeleteErr.message });
      activeUnfinished = activeUnfinished.filter((x) => !staleRowIds.includes(x.rowId));
    }

    // Reuse unfinished puzzle for this difficulty if in range.
    let chosen = activeUnfinished
      .map((x) => x.tactic)
      .find((t) => inDifficultyBand(t.rating ?? 1500, userRating, difficulty));
    let infoMessage = null;

    // No unfinished in range => allocate one and persist immediately.
    if (!chosen) {
      const activeUnfinishedIds = new Set(activeUnfinished.map((x) => x.tactic.id));
      const next = await chooseNewTactic({
        userRating,
        difficulty,
        finishedIds,
        unfinishedIds: activeUnfinishedIds,
      });
      if (!next?.tactic) return res.status(404).json({ error: 'No available tactics' });
      if (next.usedFallback) {
        infoMessage = `No more puzzles available in ${difficulty} range. Loaded closest puzzle instead.`;
      }

      // Keep unfinished rows bounded.
      if (activeUnfinished.length >= 3) {
        const removeRowId = activeUnfinished[0].rowId;
        const { error: rmErr } = await supabaseAdmin.from('UserTactic').delete().eq('id', removeRowId);
        if (rmErr) return res.status(500).json({ error: rmErr.message });
      }

      const { error: insErr } = await supabaseAdmin.from('UserTactic').insert({
        id: crypto.randomUUID(),
        userId,
        tacticId: next.tactic.id,
        solved: false,
        finished: null,
      });
      if (insErr) return res.status(500).json({ error: insErr.message });
      chosen = next.tactic;
    }

    const startFen = extractPgnTag(chosen.pgn, 'FEN');
    const puzzleLine = parseSanMovesFromPgn(chosen.pgn);
    const puzzleStartPly = extractPuzzleStartPlyFromPgn(chosen.pgn);
    if (!startFen || !puzzleLine.length) {
      return res.status(500).json({ error: 'Invalid tactic PGN: missing FEN tag or moves' });
    }

    return res.status(200).json({
      tactic: {
        id: chosen.id,
        rating: chosen.rating,
        pgn: chosen.pgn,
        numTimesPlayed: chosen.numTimesPlayed,
        disLikes: chosen.disLikes,
        startFen,
        puzzleLine,
        linkToGame: extractPgnTag(chosen.pgn, 'Site'),
        puzzleStartPly,
      },
      userRating,
      userFinishedCount,
      tacticTimesPlayed: Number.isFinite(chosen?.numTimesPlayed) ? chosen.numTimesPlayed : 0,
      infoMessage,
    });
  } catch (e) {
    console.error('[api/tactics/next] error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

