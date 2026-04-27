import { getAuthUserFromToken, getBearerAuthUser } from '../../../lib/apiAuth';
import { createRedisSubscriber } from '../../../lib/playRedis';
import {
  getPlayStatus,
  markStatusStreamConnected,
  markStatusStreamDisconnected,
  startPlayServerWatchdog,
} from '../../../lib/playServer';

const USER_STATUS_CHANNEL = (userId) => `play:user:${userId}:status`;

function writeEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function parseIncludeQueuePresence(queryValue) {
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue;
  if (raw === undefined || raw === null || raw === '') return true;
  const normalized = String(raw).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  startPlayServerWatchdog();

  const queryToken = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  const authUser =
    (queryToken ? await getAuthUserFromToken(queryToken) : null) ||
    (await getBearerAuthUser(req));
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId } = authUser;
  await markStatusStreamConnected(userId);
  const includeQueuePresence = parseIncludeQueuePresence(req.query.includeQueuePresence);
  const snapshot = await getPlayStatus(userId, { includeQueuePresence });

  const sub = await createRedisSubscriber();
  const channel = USER_STATUS_CHANNEL(userId);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');
  writeEvent(res, { type: 'status_snapshot', status: snapshot });

  const heartbeat = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 25_000);

  let cleanedUp = false;
  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeat);
    try { await markStatusStreamDisconnected(userId); } catch {}
    try { await sub.unsubscribe(channel); } catch {}
    try { if (sub.isOpen) await sub.quit(); } catch {}
    try { res.end(); } catch {}
  };

  await sub.subscribe(channel, (message) => {
    try {
      const payload = JSON.parse(message);
      writeEvent(res, payload);
    } catch {
      writeEvent(res, { type: 'message', raw: message });
    }
  });

  req.on('close', cleanup);
  req.on('error', cleanup);
}