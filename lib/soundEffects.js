/**
 * Short UI / chess feedback using files in /public/sounds.
 * Chess/move sounds use Web Audio so many can overlap; UI click uses HTML Audio (short, rare overlap).
 * Skipped when the user prefers reduced motion.
 */

import { parseFen } from 'chessops/fen';
import { Chess } from 'chessops/chess';

const BASE = '/sounds/';

const FILES = {
  pieceTouch: '266894__pfranzen__tacking-paper-to-a-cork-board.ogg',
  move: '502547__wjgibson__pencil-marking.wav',
  check: '437121__mosaichorse__magazine-page.wav',
  win: '677080__silverillusionist__healing-soft-ripple.wav',
  lose: 'u_ss015dykrt-timpani-boing-fail.mp3',
  buttonClick: '536788__egomassive__flop.ogg',
};

/** @type {AudioContext | null} */
let sharedCtx = null;
/** @type {Map<string, Promise<AudioBuffer | null>>} */
const decodePromises = new Map();

function soundAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  } catch {
    return true;
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sharedCtx = new AC();
  }
  return sharedCtx;
}

async function decodeBuffer(fullPath) {
  const ctx = getAudioContext();
  if (!ctx) return null;
  try {
    const res = await fetch(fullPath);
    if (!res.ok) return null;
    const raw = await res.arrayBuffer();
    return await ctx.decodeAudioData(raw.slice(0));
  } catch {
    return null;
  }
}

function getOrDecodeBuffer(fullPath) {
  let p = decodePromises.get(fullPath);
  if (!p) {
    p = decodeBuffer(fullPath);
    decodePromises.set(fullPath, p);
  }
  return p;
}

/**
 * Play decoded buffer on its own source (overlaps with other plays).
 */
async function playBufferOverlap(fullPath, volume = 0.88) {
  if (!soundAllowed() || !fullPath) return;
  const ctx = getAudioContext();
  if (!ctx) {
    playPathHtmlAudio(fullPath, volume);
    return;
  }
  try {
    if (ctx.state === 'suspended') await ctx.resume();
    const buffer = await getOrDecodeBuffer(fullPath);
    if (!buffer) {
      playPathHtmlAudio(fullPath, volume);
      return;
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.buffer = buffer;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
  } catch {
    playPathHtmlAudio(fullPath, volume);
  }
}

function playPathHtmlAudio(fullPath, volume = 0.88) {
  if (!soundAllowed() || !fullPath) return;
  try {
    const a = new Audio(fullPath);
    a.volume = volume;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

function fireOverlap(relPath) {
  const path = `${BASE}${relPath}`;
  void playBufferOverlap(path);
}

export function playPieceTouch() {
  fireOverlap(FILES.pieceTouch);
}

export function playChessMove({ inCheck = false } = {}) {
  fireOverlap(inCheck ? FILES.check : FILES.move);
}

export function playWinSound() {
  fireOverlap(FILES.win);
}

export function playLoseSound() {
  fireOverlap(FILES.lose);
}

export function playButtonClick() {
  playPathHtmlAudio(`${BASE}${FILES.buttonClick}`);
}

/** After an openings drill: mate / stalemate / or finished line without mate on board. */
export function playOpeningSessionEnd(lastFen, userColor) {
  if (!lastFen || (userColor !== 'white' && userColor !== 'black')) {
    playWinSound();
    return;
  }
  try {
    const setup = parseFen(lastFen.trim());
    if (setup.isErr) {
      playWinSound();
      return;
    }
    const cr = Chess.fromSetup(setup.value);
    if (cr.isErr) {
      playWinSound();
      return;
    }
    const p = cr.unwrap();
    if (!p.isEnd()) {
      playWinSound();
      return;
    }
    if (p.isCheck()) {
      const mated = p.turn;
      const userLost =
        (mated === 'white' && userColor === 'white') || (mated === 'black' && userColor === 'black');
      if (userLost) playLoseSound();
      else playWinSound();
      return;
    }
    playWinSound();
  } catch {
    playWinSound();
  }
}
