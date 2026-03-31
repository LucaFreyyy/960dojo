import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function expectedScore(playerRating, oppRating) {
  return 1 / (1 + Math.pow(10, (oppRating - playerRating) / 400));
}

function kFactor({ gamesPlayed, baseK }) {
  // First 10 finished tactics => bigger rating changes.
  const gp = Math.max(0, Math.min(10, gamesPlayed || 0));
  const multiplier = 2 - gp / 10; // 2.0 -> 1.0
  return Math.round(baseK * multiplier);
}

function parseDislikesArray(val) {
  if (Array.isArray(val) && val.length === 4) return val.map((n) => (Number.isFinite(n) ? n : 0));
  return [0, 0, 0, 0];
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
      .select('id, rating, numTimesPlayed, disLikes')
      .eq('id', tacticIdNum)
      .maybeSingle();
    if (tacticErr) return res.status(500).json({ error: tacticErr.message });
    if (!tacticRow) return res.status(404).json({ error: 'Tactic not found' });

    const tacticRating = tacticRow.rating ?? 1500;

    // Count finished tactics for user to scale rating volatility.
    const { count: userFinishedCount, error: userCountErr } = await supabaseAdmin
      .from('UserTactic')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userId)
      .not('finished', 'is', null);
    if (userCountErr) return res.status(500).json({ error: userCountErr.message });

    // Tactic volatility: if played fewer times => larger changes.
    const tacticTimesPlayed = Number.isFinite(tacticRow.numTimesPlayed) ? tacticRow.numTimesPlayed : 0;

    const e = expectedScore(userRating, tacticRating);
    const score = solved ? 1 : 0;

    const userK = kFactor({ gamesPlayed: userFinishedCount || 0, baseK: 24 });
    const tacticK = kFactor({ gamesPlayed: tacticTimesPlayed, baseK: 24 });

    const delta = Math.round(userK * (score - e));
    const newUserRating = Math.max(100, userRating + delta);
    const newTacticRating = Math.max(100, tacticRating - Math.round(tacticK * (score - e)));

    // Update UserTactic row (create if missing, but normally it exists from "open").
    const finishedAt = new Date().toISOString();
    const { data: progressRow } = await supabaseAdmin
      .from('UserTactic')
      .select('id, finished')
      .eq('userId', userId)
      .eq('tacticId', tacticIdNum)
      .maybeSingle();

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

    // Always append a new Rating row (rating graph).
    const { error: ratingInsertErr } = await supabaseAdmin.from('Rating').insert({
      id: crypto.randomUUID(),
      userId,
      type: 'tactics',
      value: newUserRating,
      createdAt: finishedAt,
    });
    if (ratingInsertErr) return res.status(500).json({ error: ratingInsertErr.message });

    // Likes/dislikes: disLikes = [win+like, win+dislike, loss+like, loss+dislike]
    let disLikes = parseDislikesArray(tacticRow.disLikes);
    if (liked === true) disLikes[solved ? 0 : 2] += 1;
    if (liked === false) disLikes[solved ? 1 : 3] += 1;

    const tacticUpdate = {
      rating: newTacticRating,
      disLikes,
      numTimesPlayed: tacticTimesPlayed + 1,
    };

    const { error: tacticUpdateErr } = await supabaseAdmin
      .from('Tactic')
      .update(tacticUpdate)
      .eq('id', tacticIdNum);
    if (tacticUpdateErr) return res.status(500).json({ error: tacticUpdateErr.message });

    return res.status(200).json({
      userRating: newUserRating,
      tacticRating: newTacticRating,
      delta,
      userFinishedCount: (userFinishedCount || 0) + 1,
      tacticTimesPlayed: tacticTimesPlayed + 1,
    });
  } catch (e) {
    console.error('[api/tactics/finish] error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

