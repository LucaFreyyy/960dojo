import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { hashEmail } from '../../../lib/hashEmail';

function isUuidLike(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveViewerUserIdFromBearer(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user?.email) return null;
  try {
    return await hashEmail(user.email);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const raw = req.query.id;
  const id = typeof raw === 'string' ? raw.trim() : Array.isArray(raw) ? String(raw[0] || '').trim() : '';
  if (!id || !isUuidLike(id)) return res.status(400).json({ error: 'Invalid study id' });

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const viewerUserId = await resolveViewerUserIdFromBearer(req);

  if (req.method === 'GET') {
    const { data: row, error } = await admin
      .from('Study')
      .select('id, ownerId, title, isPublic, createdAt, updatedAt, analysis')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[api/studies] get', error);
      return res.status(500).json({ error: 'Failed to load study' });
    }
    if (!row) return res.status(404).json({ error: 'Study not found' });
    if (!row.isPublic && (!viewerUserId || viewerUserId !== row.ownerId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { data: userRow } = await admin.from('User').select('id, name').eq('id', row.ownerId).maybeSingle();
    return res.status(200).json({
      id: row.id,
      ownerId: row.ownerId,
      ownerName: userRow?.name || null,
      title: row.title || '',
      isPublic: Boolean(row.isPublic),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      analysis: row.analysis || null,
      isOwner: viewerUserId && viewerUserId === row.ownerId,
    });
  }

  if (req.method === 'PATCH') {
    if (!viewerUserId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: existing, error: loadErr } = await admin
      .from('Study')
      .select('id, ownerId, title, isPublic')
      .eq('id', id)
      .maybeSingle();
    if (loadErr) {
      console.error('[api/studies] patch load', loadErr);
      return res.status(500).json({ error: 'Failed to update study' });
    }
    if (!existing) return res.status(404).json({ error: 'Study not found' });
    if (existing.ownerId !== viewerUserId) return res.status(403).json({ error: 'Forbidden' });

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const patch = {};
    if (typeof body.title === 'string') patch.title = body.title.trim() || null;
    if (typeof body.isPublic === 'boolean') patch.isPublic = body.isPublic;
    if (body.analysis && typeof body.analysis === 'object') patch.analysis = body.analysis;

    // Title and visibility are independent.

    const { error: upErr } = await admin.from('Study').update(patch).eq('id', id);
    if (upErr) {
      console.error('[api/studies] patch', upErr);
      return res.status(500).json({ error: 'Failed to update study' });
    }
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    if (!viewerUserId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: existing, error: loadErr } = await admin
      .from('Study')
      .select('id, ownerId')
      .eq('id', id)
      .maybeSingle();
    if (loadErr) {
      console.error('[api/studies] delete load', loadErr);
      return res.status(500).json({ error: 'Failed to delete study' });
    }
    if (!existing) return res.status(404).json({ error: 'Study not found' });
    if (existing.ownerId !== viewerUserId) return res.status(403).json({ error: 'Forbidden' });

    const { error: delErr } = await admin.from('Study').delete().eq('id', id);
    if (delErr) {
      console.error('[api/studies] delete', delErr);
      return res.status(500).json({ error: 'Failed to delete study' });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

