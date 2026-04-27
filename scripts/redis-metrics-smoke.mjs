import fs from 'node:fs';

const envRaw = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
for (const line of envRaw.split(/\r?\n/)) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue;
  const i = line.indexOf('=');
  const k = line.slice(0, i).trim();
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k && !process.env[k]) process.env[k] = v;
}

process.env.PLAY_REDIS_METRICS = '1';

const { getRedisClient } = await import('../lib/playRedis.js');
const redis = getRedisClient();

await redis.get('play:metrics:test:missing');
await redis.set('play:metrics:test:key', '1', { ex: 15 });
await redis.del('play:metrics:test:key');

await new Promise((resolve) => setTimeout(resolve, 31_000));
