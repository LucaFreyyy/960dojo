import { getBearerAuthUser } from '../../../lib/apiAuth';
import { countUnreadPlayNotifications, getPlayStatus } from '../../../lib/playServer';
import { getSocialNotificationBadgeCounts } from '../../../lib/socialNotificationCounts';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const authUser = await getBearerAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const [status, unreadNotifications, social] = await Promise.all([
      getPlayStatus(authUser.userId),
      countUnreadPlayNotifications(authUser.userId),
      getSocialNotificationBadgeCounts(authUser.userId),
    ]);
    return res.status(200).json({
      ...status,
      unreadNotifications,
      pendingFriendRequests: social.pendingFriendRequests,
      unreadFeedback: social.unreadFeedback,
    });
  } catch (error) {
    console.error('[play/status]', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
