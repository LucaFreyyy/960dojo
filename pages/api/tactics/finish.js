import { createClient } from '@supabase/supabase-js';
import { refreshUserStreakInDb } from '../../../lib/streakServer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function expectedScore(playerRating, oppRating) {
  return 1 / (1 + Math.pow(10, (oppRating - playerRating) / 400));
}

function kFactor({ gamesPlayed, baseK }) {
  const gp = Math.max(0, Math.min(20, gamesPlayed || 0));
  const multiplier = 5 - (4 * gp) / 20;
  return Math.round(baseK * multiplier);
}

function feedbackCountsFromRow(row) {
  return {
    winLike: Number.isFinite(row?.winLike) ? row.winLike : 0,
    winDislike: Number.isFinite(row?.winDislike) ? row.winDislike : 0,
    lossLike: Number.isFinite(row?.lossLike) ? row.lossLike : 0,
    lossDislike: Number.isFinite(row?.lossDislike) ? row.lossDislike : 0,
  };
}

function computeTacticScore(counts) {
  const total = counts.winLike + counts.winDislike + counts.lossLike + counts.lossDislike;
  if (total <= 0) return 0;
  return (2 * counts.winLike + 3 * counts.lossLike - 2 * counts.winDislike - 0.5 * counts.lossDislike) / total;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, tacticId, solved, liked } = req.body || {};
  if (!userId || (typeof tacticId !== 'number' && typeof tacticId !== 'string')) {
    return res.status(400).json({ error: 'Missing userId or tacticId' });
  }
  if (typeof solved !== 'boolean') return res.status(400).json({ error: 'Missing solved' });
  if (liked !== null && liked !== undefined && typeof liked !== 'boolean') {
    return res.status(400).json({ error: 'liked must be boolean or null' });
  }

  const tacticIdNum = typeof tacticId === 'string' ? Number(tacticId) : tacticId;
  if (!Number.isFinite(tacticIdNum)) return res.status(400).json({ error: 'Invalid tacticId' });

  try {
    const { data: userRatingRow, error: userRatingErr } = await supabaseAdmin
      .from('Rating')
      .select('value')
      .eq('userId', userId)
      .eq('type', 'tactics')
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (userRatingErr) return res.status(500).json({ error: userRatingErr.message });
    const userRating = userRatingRow?.value ?? 1500;

    const { data: tacticRow, error: tacticErr } = await supabaseAdmin
      .from('Tactic')
      .select('id, rating, numTimesPlayed, winLike, winDislike, lossLike, lossDislike')
      .eq('id', tacticIdNum)
      .maybeSingle();
    if (tacticErr) return res.status(500).json({ error: tacticErr.message });
    if (!tacticRow) return res.status(404).json({ error: 'Tactic not found' });

    const tacticRating = tacticRow.rating ?? 1500;

    const { count: userFinishedCount, error: userCountErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userId)
      .not('finished', 'is', null);
    if (userCountErr) return res.status(500).json({ error: userCountErr.message });

    const tacticTimesPlayed = Number.isFinite(tacticRow.numTimesPlayed) ? tacticRow.numTimesPlayed : 0;

    const e = expectedScore(userRating, tacticRating);
    const score = solved ? 1 : 0;

    const userK = kFactor({ gamesPlayed: userFinishedCount || 0, baseK: 24 });
    const tacticK = kFactor({ gamesPlayed: tacticTimesPlayed, baseK: 24 });

    const { data: progressRow } = await supabaseAdmin
      .from('UserTactic')
      .select('id, finished, solved')
      .eq('userId', userId)
      .eq('tacticId', tacticIdNum)
      .maybeSingle();

    const isFailedQueueRetry =
      progressRow?.finished != null && progressRow?.solved === false;

    const rawUserDelta = Math.round(userK * (score - e));
    let appliedUserDelta = rawUserDelta;
    if (isFailedQueueRetry && solved) {
      appliedUserDelta = Math.round(rawUserDelta * 0.5);
    }

    const newUserRating = Math.max(100, userRating + appliedUserDelta);

    let newTacticRating = tacticRating;
    if (!isFailedQueueRetry) {
      newTacticRating = Math.max(100, tacticRating - Math.round(tacticK * (score - e)));
    }

    const finishedAt = new Date().toISOString();

    if (progressRow?.id) {
      await supabaseAdmin
        .from('UserTactic')
        .update({ solved, finished: finishedAt })
        .eq('id', progressRow.id);
    } else {
      await supabaseAdmin.from('UserTactic').insert({
        id: crypto.randomUUID(),
        userId,
        tacticId: tacticIdNum,
        solved,
        finished: finishedAt,
      });
    }

    const { error: ratingInsertErr } = await supabaseAdmin.from('Rating').insert({
      id: crypto.randomUUID(),
      userId,
      type: 'tactics',
      value: newUserRating,
      createdAt: finishedAt,
    });
    if (ratingInsertErr) return res.status(500).json({ error: ratingInsertErr.message });

    const feedbackCounts = feedbackCountsFromRow(tacticRow);
    if (liked === true) {
      if (solved) feedbackCounts.winLike += 1;
      else feedbackCounts.lossLike += 1;
    }
    if (liked === false) {
      if (solved) feedbackCounts.winDislike += 1;
      else feedbackCounts.lossDislike += 1;
    }

    const tacticUpdate = { ...feedbackCounts, score: computeTacticScore(feedbackCounts) };
    if (!isFailedQueueRetry) {
      tacticUpdate.rating = newTacticRating;
      tacticUpdate.numTimesPlayed = tacticTimesPlayed + 1;
    }

    const { error: tacticUpdateErr } = await supabaseAdmin
      .from('Tactic')
      .update(tacticUpdate)
      .eq('id', tacticIdNum);
    if (tacticUpdateErr) return res.status(500).json({ error: tacticUpdateErr.message });

    const reportedFinishedCount =
      (userFinishedCount || 0) + (isFailedQueueRetry ? 0 : 1);

    try {
      const streakResult = await refreshUserStreakInDb(supabaseAdmin, userId);
      if (!streakResult?.ok) {
        console.error('[api/tactics/finish] streak refresh failed:', streakResult?.error);
      }
    } catch (streakErr) {
      console.warn('[api/tactics/finish] streak refresh exception:', streakErr);
    }

    return res.status(200).json({
      userRating: newUserRating,
      tacticRating: isFailedQueueRetry ? tacticRating : newTacticRating,
      delta: appliedUserDelta,
      userFinishedCount: reportedFinishedCount,
      tacticTimesPlayed: isFailedQueueRetry ? tacticTimesPlayed : tacticTimesPlayed + 1,
      failedQueueRetry: isFailedQueueRetry,
    });
  } catch (e) {
    console.error('[api/tactics/finish] error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
