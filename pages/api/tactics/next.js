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

function parseDifficulty(difficulty) {
  if (difficulty === 'easy') return { min: -300, max: -100 };
  if (difficulty === 'hard') return { min: 100, max: 300 };
  return { min: -100, max: 100 };
}

function inDifficultyBand(tacticRating, userRating, difficulty) {
  const { min, max } = parseDifficulty(difficulty);
  return tacticRating >= userRating + min && tacticRating <= userRating + max;
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
      .select('id, tacticId, finished')
      .eq('userId', userId);
    if (userRowsErr) return res.status(500).json({ error: userRowsErr.message });

    const { min, max } = parseDifficulty(difficulty);
    const minRating = userRating + min;
    const maxRating = userRating + max;

    const { data: bandTactics, error: bandErr } = await supabaseAdmin
      .from('Tactic')
      .select('id, rating, pgn, numTimesPlayed, disLikes')
      .gte('rating', minRating)
      .lte('rating', maxRating);
    if (bandErr) return res.status(500).json({ error: bandErr.message });

    let chosen = null;
    const bandUnfinished = (bandTactics || []).filter((t) => !finishedIds.has(t.id));

    if (!userRows?.length) {
      const { data: allForInit, error: initErr } = await supabaseAdmin
        .from('Tactic')
        .select('id, rating, pgn, numTimesPlayed, disLikes');
      if (initErr) return res.status(500).json({ error: initErr.message });

      const pool = (allForInit || []).slice();
      const picked = [];
      for (const level of ['easy', 'middle', 'hard']) {
        const candidates = pool.filter((t) => inDifficultyBand(t.rating ?? 1500, userRating, level));
        const selected = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
        if (selected) {
          picked.push(selected);
          const idx = pool.findIndex((p) => p.id === selected.id);
          if (idx >= 0) pool.splice(idx, 1);
        }
      }
      if (picked.length) {
        const inserts = picked.map((t) => ({
          id: crypto.randomUUID(),
          userId,
          tacticId: t.id,
          solved: false,
          finished: null,
        }));
        const { error: insErr } = await supabaseAdmin.from('UserTactic').insert(inserts);
        if (insErr) return res.status(500).json({ error: insErr.message });
      }
    }

    if (bandUnfinished.length) {
      chosen = bandUnfinished[Math.floor(Math.random() * bandUnfinished.length)];
    } else {
      const { data: allTactics, error: allErr } = await supabaseAdmin
        .from('Tactic')
        .select('id, rating, pgn, numTimesPlayed, disLikes');
      if (allErr) return res.status(500).json({ error: allErr.message });
      const unfinished = (allTactics || []).filter((t) => !finishedIds.has(t.id));
      if (!unfinished.length) return res.status(404).json({ error: 'No unfinished tactics' });
      chosen = unfinished
        .map((t) => ({ t, diff: Math.abs((t.rating ?? 1500) - userRating) }))
        .sort((a, b) => a.diff - b.diff)[0].t;
    }

    const { data: existingProgress, error: progressErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id')
      .eq('userId', userId)
      .eq('tacticId', chosen.id)
      .maybeSingle();
    if (progressErr) return res.status(500).json({ error: progressErr.message });
    if (!existingProgress) {
      const { error: insertErr } = await supabaseAdmin.from('UserTactic').insert({
        id: crypto.randomUUID(),
        userId,
        tacticId: chosen.id,
        solved: false,
        finished: null,
      });
      if (insertErr) return res.status(500).json({ error: insertErr.message });
    }

    const startFen = extractPgnTag(chosen.pgn, 'FEN');
    const puzzleLine = parseSanMovesFromPgn(chosen.pgn);
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
      },
      userRating,
      userFinishedCount,
      tacticTimesPlayed: Number.isFinite(chosen?.numTimesPlayed) ? chosen.numTimesPlayed : 0,
    });
  } catch (e) {
    console.error('[api/tactics/next] error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

