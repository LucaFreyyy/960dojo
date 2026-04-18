import { getBearerAuthUser } from '../../../lib/apiAuth';
import { submitMove } from '../../../lib/playServer';

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
    if (!body?.gameId || !body?.from || !body?.to || !body?.san) {
      return res.status(400).json({ error: 'Missing gameId, from, to, or san' });
    }
    const result = await submitMove({
      gameId: body.gameId,
      userId: authUser.userId,
      clientFen: body.clientFen || null,
      from: body.from,
      to: body.to,
      san: body.san,
      promotion: body.promotion ?? null,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('[play/move]', error);
    return res.status(400).json({ error: error.message || 'Move failed' });
  }
}
