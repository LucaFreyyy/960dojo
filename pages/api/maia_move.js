import { getMaiaMoveFromFen } from '../../lib/maiaServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fen, rating, opponentRating } = req.body || {};
  if (typeof fen !== 'string' || !fen.trim()) {
    return res.status(400).json({ error: 'fen is required' });
  }
  if (fen.length > 200) {
    return res.status(400).json({ error: 'fen too long' });
  }

  const result = await getMaiaMoveFromFen({ fen: fen.trim(), rating, opponentRating });
  if (!result.ok) {
    console.error('[maia_move] FAILED:', result.error); // <-- add this
    return res.status(503).json({ error: result.error || 'maia unavailable' });
  }
  return res.status(200).json({
    uci: result.uci,
    san: result.san,
  });
}