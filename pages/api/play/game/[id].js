import { getBearerAuthUser } from '../../../../lib/apiAuth';
import { getGameSnapshot } from '../../../../lib/playServer';

function normalizeId(raw) {
  const id = Array.isArray(raw) ? raw[0] : raw;
  return typeof id === 'string' && id ? id : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const authUser = await getBearerAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const id = normalizeId(req.query.id);
    if (!id) return res.status(400).json({ error: 'Invalid game id' });
    const game = await getGameSnapshot(id, authUser.userId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    return res.status(200).json({ game });
  } catch (error) {
    console.error('[play/game]', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
