import { getBearerAuthUser } from '../../../lib/apiAuth';
import { countUnreadPlayNotifications, listPlayNotifications } from '../../../lib/playServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const authUser = await getBearerAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const countOnly = req.query.countOnly === '1' || req.query.countOnly === 'true';
    if (countOnly) {
      const unread = await countUnreadPlayNotifications(authUser.userId);
      return res.status(200).json({ unreadPlayNotifications: unread });
    }
    const notifications = await listPlayNotifications(authUser.userId);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('[play/notifications]', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
