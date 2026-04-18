import { createClient } from 'redis';

let redisClientPromise = null;

async function connectClient(client) {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('Missing REDIS_URL');
  }
  if (!redisClientPromise) {
    const client = createClient({ url: redisUrl });
    client.on('error', (error) => {
      console.error('[playRedis] redis error:', error);
    });
    redisClientPromise = connectClient(client);
  }
  return redisClientPromise;
}

export async function createRedisSubscriber() {
  const client = await getRedisClient();
  const sub = client.duplicate();
  sub.on('error', (error) => {
    console.error('[playRedis] redis subscriber error:', error);
  });
  await connectClient(sub);
  return sub;
}
