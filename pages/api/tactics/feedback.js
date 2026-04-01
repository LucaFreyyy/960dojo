import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseDislikesArray(val) {
  if (Array.isArray(val) && val.length === 4) return val.map((n) => (Number.isFinite(n) ? n : 0));
  return [0, 0, 0, 0];
}

function feedbackIndex({ solved, liked }) {
  if (solved && liked) return 0; // win+like
  if (solved && !liked) return 1; // win+dislike
  if (!solved && liked) return 2; // loss+like
  return 3; // loss+dislike
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
      .select('id, disLikes')
      .eq('id', tacticIdNum)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!tacticRow) return res.status(404).json({ error: 'Tactic not found' });

    const disLikes = parseDislikesArray(tacticRow.disLikes);

    if (removeOnly === true) {
      if (typeof prevLiked !== 'boolean') {
        return res.status(400).json({ error: 'Missing prevLiked' });
      }
      const prevIdx = feedbackIndex({ solved, liked: prevLiked });
      disLikes[prevIdx] = Math.max(0, (disLikes[prevIdx] || 0) - 1);
      const { error: updateErr } = await supabaseAdmin
        .from('Tactic')
        .update({ disLikes })
        .eq('id', tacticIdNum);
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      return res.status(200).json({ success: true, disLikes });
    }

    if (typeof liked !== 'boolean') return res.status(400).json({ error: 'Invalid feedback payload' });

    if (typeof prevLiked === 'boolean') {
      const prevIdx = feedbackIndex({ solved, liked: prevLiked });
      disLikes[prevIdx] = Math.max(0, (disLikes[prevIdx] || 0) - 1);
    }
    const nextIdx = feedbackIndex({ solved, liked });
    disLikes[nextIdx] = (disLikes[nextIdx] || 0) + 1;

    const { error: updateErr } = await supabaseAdmin
      .from('Tactic')
      .update({ disLikes })
      .eq('id', tacticIdNum);
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.status(200).json({ success: true, disLikes });
  } catch {
    return res.status(500).json({ error: 'Internal error' });
  }
}

