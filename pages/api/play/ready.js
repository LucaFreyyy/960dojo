import { getBearerAuthUser } from '../../../lib/apiAuth';
import { markPlayerConnected } from '../../../lib/playServer';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const authUser = await getBearerAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const body = parseBody(req);
    if (!body?.gameId) return res.status(400).json({ error: 'Missing gameId' });
    const game = await markPlayerConnected(body.gameId, authUser.userId);
    return res.status(200).json({ game });
  } catch (error) {
    console.error('[play/ready]', error);
    return res.status(400).json({ error: error.message || 'Could not mark player ready' });
  }
}
