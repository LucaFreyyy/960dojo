import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { buildOpeningAnalysisPgn } from '../../../lib/openingAnalysisPgn';

function isUuidLike(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const raw = req.query.id;
  const id = typeof raw === 'string' ? raw.trim() : Array.isArray(raw) ? String(raw[0] || '').trim() : '';
  if (!id || !isUuidLike(id)) {
    return res.status(400).json({ error: 'Invalid opening share id' });
  }

  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from('UserOpening')
      .select('id, userId, color, openingNr, pgn, finished')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[api/opening-share] query error:', error);
      return res.status(500).json({ error: 'Failed to load opening' });
    }
    if (!data) return res.status(404).json({ error: 'Opening not found' });

    const analysisPgn = buildOpeningAnalysisPgn(data.openingNr, data.pgn || '');
    if (!analysisPgn) return res.status(422).json({ error: 'Opening cannot be converted to analysis PGN' });

    let playerName = null;
    if (data.userId) {
      const { data: userRow } = await admin.from('User').select('name').eq('id', data.userId).maybeSingle();
      playerName = userRow?.name || null;
    }

    let ratingAtTime = null;
    if (data.userId && data.finished) {
      const { data: ratingAtRow } = await admin
        .from('Rating')
        .select('value, createdAt')
        .eq('userId', data.userId)
        .eq('type', 'openings')
        .lte('createdAt', data.finished)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();
      ratingAtTime = Number.isFinite(ratingAtRow?.value) ? ratingAtRow.value : null;
    }

    let currentRating = null;
    if (data.userId) {
      const { data: currentRow } = await admin
        .from('Rating')
        .select('value, createdAt')
        .eq('userId', data.userId)
        .eq('type', 'openings')
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();
      currentRating = Number.isFinite(currentRow?.value) ? currentRow.value : null;
    }

    return res.status(200).json({
      id: data.id,
      openingNr: data.openingNr,
      finished: data.finished,
      userId: data.userId,
      color: data.color,
      playerName,
      ratingAtTime,
      currentRating,
      analysisPgn,
    });
  } catch (e) {
    console.error('[api/opening-share] fatal:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
