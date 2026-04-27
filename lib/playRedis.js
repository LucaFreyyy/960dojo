import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

let upstashClient = null;
let metricsClient = null;
let metricsIntervalStarted = false;

const READ_COMMANDS = new Set([
  'get',
  'mget',
  'hget',
  'hgetall',
  'lrange',
  'llen',
  'lindex',
  'smembers',
  'sismember',
  'zrange',
  'zscore',
  'zrevrange',
  'exists',
  'ttl',
  'pttl',
  'scan',
  'keys',
  'ping',
]);

const metrics = {
  startedAt: Date.now(),
  windowStartedAt: Date.now(),
  totalReads: 0,
  totalWrites: 0,
  windowReads: 0,
  windowWrites: 0,
  perCommandWindow: new Map(),
};

function recordCommand(commandName) {
  const command = String(commandName || '').toLowerCase();
  const isRead = READ_COMMANDS.has(command);
  if (isRead) {
    metrics.totalReads += 1;
    metrics.windowReads += 1;
  } else {
    metrics.totalWrites += 1;
    metrics.windowWrites += 1;
  }
  metrics.perCommandWindow.set(command, (metrics.perCommandWindow.get(command) || 0) + 1);
}

function maybeStartMetricsInterval() {
  if (metricsIntervalStarted) return;
  if (process.env.PLAY_REDIS_METRICS !== '1') return;
  metricsIntervalStarted = true;
  setInterval(() => {
    const totalWindow = metrics.windowReads + metrics.windowWrites;
    if (!totalWindow) return;
    const topCommands = [...metrics.perCommandWindow.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cmd, count]) => `${cmd}:${count}`)
      .join(', ');
    const windowSeconds = Math.max(1, Math.round((Date.now() - metrics.windowStartedAt) / 1000));
    console.log(
      `[redis-metrics] ${windowSeconds}s window reads=${metrics.windowReads} writes=${metrics.windowWrites} top=[${topCommands}] totals(reads=${metrics.totalReads}, writes=${metrics.totalWrites})`
    );
    metrics.windowReads = 0;
    metrics.windowWrites = 0;
    metrics.perCommandWindow.clear();
    metrics.windowStartedAt = Date.now();
  }, 30_000).unref?.();
}

function wrapPipeline(pipeline) {
  let proxy = null;
  proxy = new Proxy(pipeline, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      return (...args) => {
        if (prop !== 'exec') {
          recordCommand(String(prop));
        }
        const out = value.apply(target, args);
        return out === target ? proxy : out;
      };
    },
  });
  return proxy;
}

function instrumentRedisClient(client) {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (prop === 'pipeline' && typeof value === 'function') {
        return (...args) => wrapPipeline(value.apply(target, args));
      }
      if (typeof value !== 'function') return value;
      return (...args) => {
        recordCommand(String(prop));
        return value.apply(target, args);
      };
    },
  });
}

export function getRedisClient() {
  if (!upstashClient) {
    upstashClient = new Redis({
      url: process.env.REDIS_KV_REST_API_URL,
      token: process.env.REDIS_KV_REST_API_TOKEN,
    });
  }
  maybeStartMetricsInterval();
  if (!metricsClient) {
    metricsClient = instrumentRedisClient(upstashClient);
  }
  return metricsClient;
}

export async function createRedisSubscriber() {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (error) => {
    console.error('[playRedis] redis subscriber error:', error);
  });
  if (!client.isOpen) await client.connect();
  return client;
}