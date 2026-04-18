import { getBearerAuthUser } from '../../../lib/apiAuth';
import {
  cancelDrawOffer,
  cancelPlayQueue,
  cancelRematchNotificationsForGame,
  offerDraw,
  requestRematch,
  resignGame,
  respondToDraw,
  respondToRematch,
} from '../../../lib/playServer';

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
    const action = body?.action;

    if (action === 'resign') {
      const game = await resignGame(body.gameId, authUser.userId);
      return res.status(200).json({ game });
    }
    if (action === 'offer_draw') {
      const game = await offerDraw(body.gameId, authUser.userId);
      return res.status(200).json({ game });
    }
    if (action === 'cancel_draw_offer') {
      const game = await cancelDrawOffer(body.gameId, authUser.userId);
      return res.status(200).json({ game });
    }
    if (action === 'accept_draw') {
      const game = await respondToDraw(body.gameId, authUser.userId, true);
      return res.status(200).json({ game });
    }
    if (action === 'decline_draw') {
      const game = await respondToDraw(body.gameId, authUser.userId, false);
      return res.status(200).json({ game });
    }
    if (action === 'request_rematch') {
      const notification = await requestRematch(body.gameId, authUser.userId);
      return res.status(200).json({ notification });
    }
    if (action === 'accept_rematch') {
      const result = await respondToRematch(body.notificationId, authUser.userId, true);
      return res.status(200).json(result);
    }
    if (action === 'decline_rematch') {
      const result = await respondToRematch(body.notificationId, authUser.userId, false);
      return res.status(200).json(result);
    }
    if (action === 'cancel_rematch') {
      await cancelRematchNotificationsForGame(body.gameId, authUser.userId);
      return res.status(200).json({ ok: true });
    }
    if (action === 'play_again') {
      await cancelRematchNotificationsForGame(body.gameId, authUser.userId);
      await cancelPlayQueue(authUser.userId);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('[play/action]', error);
    return res.status(400).json({ error: error.message || 'Action failed' });
  }
}
