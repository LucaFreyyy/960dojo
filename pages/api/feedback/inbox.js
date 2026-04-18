import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { getBearerAuthUser, userIdIsFeedbackAdmin } from '../../../lib/feedbackAdminServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = await getBearerAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAdmin = await userIdIsFeedbackAdmin(authUser.userId);
  const q = req.query.countOnly;
  const countOnly = q === '1' || q === 'true';

  try {
    const supabaseAdmin = createSupabaseAdmin();

    if (countOnly) {
      if (!isAdmin) {
        return res.status(200).json({ unreadFeedback: 0 });
      }
      const { count, error } = await supabaseAdmin
        .from('Feedback')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);
      if (error) {
        console.error('[feedback/inbox] count error:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ unreadFeedback: count ?? 0 });
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabaseAdmin
      .from('Feedback')
      .select('id, userId, email, message, type, createdAt, read')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('[feedback/inbox] list error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ feedback: data ?? [] });
  } catch (e) {
    console.error('[feedback/inbox]', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
