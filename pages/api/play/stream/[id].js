import { getAuthUserFromToken, getBearerAuthUser } from '../../../../lib/apiAuth';
import { createRedisSubscriber } from '../../../../lib/playRedis';
import { getGameSnapshot } from '../../../../lib/playServer';

function normalizeId(raw) {
  const id = Array.isArray(raw) ? raw[0] : raw;
  return typeof id === 'string' && id ? id : null;
}

function writeEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
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
  const id = normalizeId(req.query.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid game id' });
  }

  const queryToken = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  const authUser = (queryToken ? await getAuthUserFromToken(queryToken) : null) || (await getBearerAuthUser(req));
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const game = await getGameSnapshot(id, authUser.userId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const sub = await createRedisSubscriber();
  const channel = `play:game:${id}`;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');
  writeEvent(res, { type: 'snapshot', game });

  const heartbeat = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 25_000);

  const cleanup = async () => {
    clearInterval(heartbeat);
    try {
      await sub.unsubscribe(channel);
    } catch {}
    try {
      if (sub.isOpen) await sub.quit();
    } catch {}
    try {
      res.end();
    } catch {}
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
