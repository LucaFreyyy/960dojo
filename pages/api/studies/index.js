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
  if (req.method === 'GET') {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';
    const mine = req.query.mine === '1';
    const sortRaw = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'createdAt';
    const sort = sortRaw === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const orderRaw = typeof req.query.order === 'string' ? req.query.order.trim().toLowerCase() : 'desc';
    const ascending = orderRaw === 'asc';
    const take = Math.min(50, Math.max(1, parseInt(String(req.query.take || '20'), 10) || 20));

    let admin;
    try {
      admin = createSupabaseAdmin();
    } catch {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const viewerUserId = await resolveViewerUserIdFromBearer(req);

    let filterOwnerId = '';
    if (mine) {
      if (!viewerUserId) return res.status(401).json({ error: 'Unauthorized' });
      filterOwnerId = viewerUserId;
    } else if (username) {
      const { data: userRow, error: userErr } = await admin
        .from('User')
        .select('id')
        .ilike('name', username)
        .limit(1)
        .maybeSingle();
      if (userErr) {
        console.error('[api/studies] username lookup', userErr);
        return res.status(500).json({ error: 'Failed to resolve username' });
      }
      if (!userRow?.id) return res.status(200).json({ items: [] });
      filterOwnerId = userRow.id;
    }

    let query = admin
      .from('Study')
      .select('id, ownerId, title, isPublic, createdAt, updatedAt')
      .order(sort, { ascending })
      .limit(take);

    if (filterOwnerId) {
      query = query.eq('ownerId', filterOwnerId);
    }

    if (q) {
      query = query.ilike('title', `%${q.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`);
    }

    // Public for everyone; include private only for the viewer themselves.
    if (!viewerUserId) {
      query = query.eq('isPublic', true);
    } else if (viewerUserId !== filterOwnerId) {
      query = query.or(`isPublic.eq.true,ownerId.eq.${viewerUserId}`);
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error('[api/studies] list', error);
      return res.status(500).json({ error: 'Failed to load studies' });
    }

    const ownerIds = [...new Set((rows || []).map((r) => r.ownerId).filter(Boolean))];
    const ownersById = new Map();
    if (ownerIds.length) {
      const { data: users } = await admin.from('User').select('id, name').in('id', ownerIds);
      (users || []).forEach((u) => ownersById.set(u.id, u));
    }

    const items = (rows || []).map((r) => ({
      id: r.id,
      ownerId: r.ownerId,
      ownerName: ownersById.get(r.ownerId)?.name || null,
      title: r.title || '',
      isPublic: Boolean(r.isPublic),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return res.status(200).json({ items });
  }

  if (req.method === 'POST') {
    const viewerUserId = await resolveViewerUserIdFromBearer(req);
    if (!viewerUserId) return res.status(401).json({ error: 'Unauthorized' });

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const isPublicRaw = typeof body.isPublic === 'boolean' ? body.isPublic : false;
    const analysis = body.analysis && typeof body.analysis === 'object' ? body.analysis : null;
    if (!analysis) return res.status(400).json({ error: 'analysis required' });

    let admin;
    try {
      admin = createSupabaseAdmin();
    } catch {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const isPublic = isPublicRaw;

    const { data, error } = await admin
      .from('Study')
      .insert({
        ownerId: viewerUserId,
        title: title || null,
        isPublic,
        analysis,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[api/studies] create', error);
      return res.status(500).json({ error: 'Failed to create study' });
    }
    return res.status(200).json({ id: data.id });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

