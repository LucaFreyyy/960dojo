import STARTING_POSITIONS from './chess960Positions.json';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const PIECE_LETTER = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
};

export function positionNrToStartFen(nr) {
  const n = Number(nr);
  if (!Number.isInteger(n) || n < 0 || n > 959) {
    throw new Error(`Invalid Chess960 index: ${nr}`);
  }
  const key = String(n).padStart(3, '0');
  const frontRank = STARTING_POSITIONS[key];
  if (!frontRank) throw new Error(`Missing position ${key}`);
  return `${frontRank.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${frontRank} w KQkq - 0 1`;
}

export function filterPositionNrsByPieceFiles(pieceKind, files) {
  const letter = PIECE_LETTER[pieceKind];
  if (!letter) return [];
  const indices = (files || [])
    .map((f) => FILES.indexOf(f))
    .filter((i) => i >= 0);
  if (!indices.length) return [];

  const out = [];
  for (let n = 0; n < 960; n += 1) {
    const key = String(n).padStart(3, '0');
    const row = STARTING_POSITIONS[key];
    if (!row) continue;
    const ok = indices.every((i) => row[i] === letter);
    if (ok) out.push(n);
  }
  return out;
}

export function randomInt(n) {
  return Math.floor(Math.random() * n);
}

export function pickRandom(arr) {
  if (!arr.length) return null;
  return arr[randomInt(arr.length)];
}

export { FILES as CHESS960_FILES };
