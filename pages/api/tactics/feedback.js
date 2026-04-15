import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function feedbackCountsFromRow(row) {
  return {
    winLike: Number.isFinite(row?.winLike) ? row.winLike : 0,
    winDislike: Number.isFinite(row?.winDislike) ? row.winDislike : 0,
    lossLike: Number.isFinite(row?.lossLike) ? row.lossLike : 0,
    lossDislike: Number.isFinite(row?.lossDislike) ? row.lossDislike : 0,
  };
}

function addFeedbackCount(counts, { solved, liked, delta }) {
  if (solved && liked) counts.winLike = Math.max(0, counts.winLike + delta);
  else if (solved && !liked) counts.winDislike = Math.max(0, counts.winDislike + delta);
  else if (!solved && liked) counts.lossLike = Math.max(0, counts.lossLike + delta);
  else counts.lossDislike = Math.max(0, counts.lossDislike + delta);
}

function toDislikesArray(counts) {
  return [counts.winLike, counts.winDislike, counts.lossLike, counts.lossDislike];
}

function computeTacticScore(counts) {
  const total = counts.winLike + counts.winDislike + counts.lossLike + counts.lossDislike;
  if (total <= 0) return 0;
  return (2 * counts.winLike + 3 * counts.lossLike - 2 * counts.winDislike - 0.5 * counts.lossDislike) / total;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { tacticId, solved, liked, prevLiked, removeOnly } = req.body || {};
  const tacticIdNum = Number(tacticId);
  if (!Number.isFinite(tacticIdNum)) return res.status(400).json({ error: 'Invalid tacticId' });
  if (typeof solved !== 'boolean') return res.status(400).json({ error: 'Invalid feedback payload' });

  try {
    const { data: tacticRow, error } = await supabaseAdmin
      .from('Tactic')
      .select('id, winLike, winDislike, lossLike, lossDislike')
      .eq('id', tacticIdNum)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!tacticRow) return res.status(404).json({ error: 'Tactic not found' });

    const feedbackCounts = feedbackCountsFromRow(tacticRow);

    if (removeOnly === true) {
      if (typeof prevLiked !== 'boolean') {
        return res.status(400).json({ error: 'Missing prevLiked' });
      }
      addFeedbackCount(feedbackCounts, { solved, liked: prevLiked, delta: -1 });
      const { error: updateErr } = await supabaseAdmin
        .from('Tactic')
        .update({ ...feedbackCounts, score: computeTacticScore(feedbackCounts) })
        .eq('id', tacticIdNum);
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      return res.status(200).json({ success: true, disLikes: toDislikesArray(feedbackCounts) });
    }

    if (typeof liked !== 'boolean') return res.status(400).json({ error: 'Invalid feedback payload' });

    if (typeof prevLiked === 'boolean') {
      addFeedbackCount(feedbackCounts, { solved, liked: prevLiked, delta: -1 });
    }
    addFeedbackCount(feedbackCounts, { solved, liked, delta: 1 });

    const { error: updateErr } = await supabaseAdmin
      .from('Tactic')
      .update({ ...feedbackCounts, score: computeTacticScore(feedbackCounts) })
      .eq('id', tacticIdNum);
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.status(200).json({ success: true, disLikes: toDislikesArray(feedbackCounts) });
  } catch {
    return res.status(500).json({ error: 'Internal error' });
  }
}

