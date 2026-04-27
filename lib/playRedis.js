import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

let upstashClient = null;

export function getRedisClient() {
  if (!upstashClient) {
    upstashClient = new Redis({
      url: process.env.REDIS_KV_REST_API_URL,
      token: process.env.REDIS_KV_REST_API_TOKEN,
    });
  }
  return upstashClient;
}

export async function createRedisSubscriber() {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (error) => {
    console.error('[playRedis] redis subscriber error:', error);
  });
  if (!client.isOpen) await client.connect();
  return client;
}