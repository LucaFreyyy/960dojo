import { Chess } from 'chess.js';

export function parseSanMovetext(raw) {
  if (typeof raw !== 'string') return [];
  const body = raw
    .split('\n')
    .filter((line) => !line.startsWith('['))
    .join(' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return body
    .split(' ')
    .map((t) => t.replace(/^\d+\.(\.\.)?/, '').replace(/^\d+\.\.\./, '').trim())
    .filter((t) => t && !/^\d+$/.test(t));
}

export function buildPgnFromSans(startFen, sans) {
  const game = new Chess(startFen, { chess960: true });
  const tokens = [];
  for (let i = 0; i < sans.length; i += 1) {
    const san = sans[i];
    const moveNo = game.moveNumber();
    if (game.turn() === 'w') tokens.push(`${moveNo}. ${san}`);
    else tokens.push(`${moveNo}... ${san}`);
    const ok = game.move(san, { sloppy: true });
    if (!ok) break;
  }
  return tokens.join(' ');
}

export function replaySansFromStoredPgn(pgnText, startFen) {
  if (!pgnText || !String(pgnText).trim()) return [];
  const lines = pgnText.split('\n').filter(Boolean);
  const looksLegacy = lines.some((l) => {
    const t = l.trim().split(/\s+/);
    const last = t[t.length - 1];
    return l.includes('/') && last && last.length >= 4 && !last.includes('/');
  });

  if (!looksLegacy) return parseSanMovetext(pgnText);

  const game = new Chess(startFen, { chess960: true });
  const sans = [];
  for (const line of lines) {
    const tok = line.trim().split(/\s+/);
    const uci = tok[tok.length - 1];
    if (!uci || uci.length < 4) continue;
    if (uci.includes('/')) continue;
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promo = uci[4];
    const m = game.move({ from, to, promotion: promo || undefined });
    if (m) sans.push(m.san);
  }
  return sans;
}
