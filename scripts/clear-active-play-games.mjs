import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
const txt = fs.readFileSync(envPath, 'utf8');
const m = txt.match(/^REDIS_URL=(.+)$/m);
if (!m) throw new Error('REDIS_URL not found in .env');
const url = m[1].trim().replace(/^["']|["']$/g, '');

const c = createClient({ url });
await c.connect();

const activeKeys = [];
let cursor = '0';
do {
  const reply = await c.scan(cursor, { MATCH: 'play:user:*:active-game', COUNT: 500 });
  cursor = reply.cursor;
  activeKeys.push(...reply.keys);
} while (cursor !== '0');

const gameIds = [...new Set((await Promise.all(activeKeys.map((k) => c.get(k)))).filter(Boolean))];
const gameStateKeys = gameIds.map((id) => `play:game:${id}:state`);
const keysToDelete = [...activeKeys, ...gameStateKeys];
let deleted = 0;
for (const k of keysToDelete) {
  deleted += await c.del(k);
}

console.log(
  JSON.stringify(
    {
      activeKeyCount: activeKeys.length,
      gameCount: gameIds.length,
      deletedKeys: deleted,
    },
    null,
    2
  )
);

await c.quit();
