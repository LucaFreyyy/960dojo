import { createSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getBearerAuthUser, userIdIsFeedbackAdmin } from '../../../../lib/feedbackAdminServer';

function normalizeId(raw) {
  const id = Array.isArray(raw) ? raw[0] : raw;
  return typeof id === 'string' && id.length >= 8 ? id : null;
}

export default async function handler(req, res) {
  const id = normalizeId(req.query.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const authUser = await getBearerAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAdmin = await userIdIsFeedbackAdmin(authUser.userId);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();

    if (req.method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body || '{}');
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
      }
      if (typeof body?.read !== 'boolean') {
        return res.status(400).json({ error: 'Body must include read: boolean' });
      }
      const { data, error } = await supabaseAdmin
        .from('Feedback')
        .update({ read: body.read })
        .eq('id', id)
        .select('id, read')
        .maybeSingle();
      if (error) {
        console.error('[feedback/inbox id] patch:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json({ success: true, ...data });
    }

    if (req.method === 'DELETE') {
      const { data: deleted, error } = await supabaseAdmin.from('Feedback').delete().eq('id', id).select('id');
      if (error) {
        console.error('[feedback/inbox id] delete:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!deleted?.length) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[feedback/inbox id]', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
