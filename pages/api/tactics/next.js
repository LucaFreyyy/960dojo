import { createClient } from '@supabase/supabase-js';
import { extractPgnTag } from '../../../lib/tacticPgnUtils';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  const isGuest = !userId;

  try {
    if (isGuest) {
      const guestRating = 1500;
      const next = await chooseNewTactic({
        userRating: guestRating,
        difficulty,
        finishedIds: new Set(),
        unfinishedIds: new Set(),
      });
      if (!next?.tactic) return res.status(404).json({ error: 'No available tactics' });
      const chosen = next.tactic;
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
        userRating: guestRating,
        userFinishedCount: 0,
        tacticTimesPlayed: Number.isFinite(chosen?.numTimesPlayed) ? chosen.numTimesPlayed : 0,
        infoMessage: next.usedFallback
          ? `No more puzzles available in ${difficulty} range. Loaded closest puzzle instead.`
          : null,
      });
    }

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

    const { data: unfinishedProgress, error: unfinishedErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id, tacticId')
      .eq('userId', userId)
      .is('finished', null)
      .order('id', { ascending: true });
    if (unfinishedErr) return res.status(500).json({ error: unfinishedErr.message });

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

          if ((unfinishedProgress || []).length >= 3) {
            const { error: rmErr } = await supabaseAdmin
              .from('UserTactic')
              .delete()
              .eq('id', unfinishedProgress[0].id);
            if (rmErr) return res.status(500).json({ error: rmErr.message });
          }

          // Keep UserTactic.solved/finished as the last recorded outcome; /api/tactics/finish overwrites on completion.

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
            failedQueueRetry: true,
          });
        }
      }
    }

    const unfinishedRows = unfinishedProgress || [];
    const unfinishedTacticIds = unfinishedRows.map((r) => r.tacticId);

    let unfinishedTactics = [];
    if (unfinishedTacticIds.length) {
      const { data: unfinishedTacticsRows, error: unfinishedTacticsErr } = await supabaseAdmin
        .from('Tactic')
        .select('id, rating, pgn, numTimesPlayed, disLikes')
        .in('id', unfinishedTacticIds);
      if (unfinishedTacticsErr) return res.status(500).json({ error: unfinishedTacticsErr.message });
      unfinishedTactics = unfinishedTacticsRows || [];
    }

    const tacticById = new Map(unfinishedTactics.map((t) => [t.id, t]));
    const activeUnfinished = unfinishedRows
      .map((r) => ({ rowId: r.id, tactic: tacticById.get(r.tacticId) }))
      .filter((x) => x.tactic);

    // Prefer resuming an unfinished puzzle in the selected difficulty band; otherwise resume any in-progress row.
    let chosen = null;
    let infoMessage = null;
    const bandMatch = activeUnfinished.find((x) =>
      inDifficultyBand(x.tactic.rating ?? 1500, userRating, difficulty)
    );
    if (bandMatch) {
      chosen = bandMatch.tactic;
    } else if (activeUnfinished.length) {
      chosen = activeUnfinished[0].tactic;
      infoMessage = 'Continuing your puzzle in progress.';
    }

    // No unfinished => allocate one and persist immediately.
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

