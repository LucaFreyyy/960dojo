import { createSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { getBearerAuthUser } from '../../../lib/feedbackAdminServer';
import { refreshUserStreakInDb } from '../../../lib/streakServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authUser = await getBearerAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const { userId } = req.body || {};
  if (!userId || userId !== authUser.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const admin = createSupabaseAdmin();
    const r = await refreshUserStreakInDb(admin, userId);
    if (!r.ok) {
      console.error('[api/streak/refresh] streak update failed:', r.error);
      return res.status(500).json({ error: r.error });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[api/streak/refresh]', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
