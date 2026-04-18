import { getBearerAuthUser } from '../../../../lib/apiAuth';
import { markPlayNotificationRead } from '../../../../lib/playServer';

function normalizeId(raw) {
  const id = Array.isArray(raw) ? raw[0] : raw;
  return typeof id === 'string' && id ? id : null;
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body || {};
}

export default async function handler(req, res) {
  try {
    const authUser = await getBearerAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const id = normalizeId(req.query.id);
    if (!id) return res.status(400).json({ error: 'Invalid notification id' });

    if (req.method === 'PATCH') {
      const body = parseBody(req);
      if (typeof body.read !== 'boolean') {
        return res.status(400).json({ error: 'Body must include read: boolean' });
      }
      const result = await markPlayNotificationRead(id, authUser.userId, body.read);
      if (!result) return res.status(404).json({ error: 'Notification not found' });
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[play/notifications id]', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
