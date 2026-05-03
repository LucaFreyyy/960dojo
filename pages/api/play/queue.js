import { getBearerAuthUser } from '../../../lib/apiAuth';
import { cancelPlayQueue, joinPlayQueue } from '../../../lib/playServer';

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

    if (req.method === 'POST') {
      const body = parseBody(req);
      const timeRaw = typeof body?.time === 'string' ? body.time.trim() : '';
      if (!timeRaw) return res.status(400).json({ error: 'Missing time control' });
      const result = await joinPlayQueue(authUser.userId, timeRaw);
      return res.status(200).json(result);
    }

    if (req.method === 'DELETE') {
      const result = await cancelPlayQueue(authUser.userId);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[play/queue]', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
