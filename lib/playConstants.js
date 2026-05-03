export const PLAY_TIME_CONTROLS = [
  { time: '1+0', label: 'Bullet', initialMs: 60_000, incrementMs: 0, ratingType: 'bullet' },
  { time: '2+1', label: 'Bullet', initialMs: 120_000, incrementMs: 1_000, ratingType: 'bullet' },
  { time: '3+0', label: 'Blitz', initialMs: 180_000, incrementMs: 0, ratingType: 'blitz' },
  { time: '3+2', label: 'Blitz', initialMs: 180_000, incrementMs: 2_000, ratingType: 'blitz' },
  { time: '5+0', label: 'Blitz', initialMs: 300_000, incrementMs: 0, ratingType: 'blitz' },
  { time: '5+3', label: 'Blitz', initialMs: 300_000, incrementMs: 3_000, ratingType: 'blitz' },
  { time: '10+0', label: 'Rapid', initialMs: 600_000, incrementMs: 0, ratingType: 'rapid' },
  { time: '10+5', label: 'Rapid', initialMs: 600_000, incrementMs: 5_000, ratingType: 'rapid' },
  { time: '15+10', label: 'Rapid', initialMs: 900_000, incrementMs: 10_000, ratingType: 'rapid' },
  { time: '30+0', label: 'Classical', initialMs: 1_800_000, incrementMs: 0, ratingType: 'classical' },
  { time: '30+30', label: 'Classical', initialMs: 1_800_000, incrementMs: 30_000, ratingType: 'classical' },
];

/** Queue keys `custom:<minutes>+<incrementSeconds>` — separate pools from preset `M+I` keys. */
export const CUSTOM_TIME_QUEUE_PREFIX = 'custom:';

const CUSTOM_MIN_MINUTES = 1;
const CUSTOM_MAX_MINUTES = 180;
const CUSTOM_MAX_INCREMENT_SECONDS = 180;

const RATING_LABEL = {
  bullet: 'Bullet',
  blitz: 'Blitz',
  rapid: 'Rapid',
  classical: 'Classical',
};

export function isCustomTimeQueueKey(time) {
  return typeof time === 'string' && time.startsWith(CUSTOM_TIME_QUEUE_PREFIX);
}

export function parseCustomTimeQueueKey(time) {
  if (!isCustomTimeQueueKey(time)) return null;
  const rest = time.slice(CUSTOM_TIME_QUEUE_PREFIX.length);
  const match = /^(\d+)\+(\d+)$/.exec(rest);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const incSeconds = parseInt(match[2], 10);
  if (!Number.isFinite(minutes) || !Number.isFinite(incSeconds)) return null;
  return { minutes, incSeconds };
}

export function buildCustomTimeQueueKey(minutes, incSeconds) {
  const m = Math.floor(Number(minutes));
  const s = Math.floor(Number(incSeconds));
  return `${CUSTOM_TIME_QUEUE_PREFIX}${m}+${s}`;
}

/** Client-friendly validation; returns error message or null. */
export function validateCustomTimeInput(minutes, incrementSeconds) {
  const m = Number(minutes);
  const s = Number(incrementSeconds);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 'Enter valid numbers.';
  if (m < CUSTOM_MIN_MINUTES || m > CUSTOM_MAX_MINUTES) {
    return `Starting time must be ${CUSTOM_MIN_MINUTES}–${CUSTOM_MAX_MINUTES} minutes.`;
  }
  if (s < 0 || s > CUSTOM_MAX_INCREMENT_SECONDS) {
    return `Increment must be 0–${CUSTOM_MAX_INCREMENT_SECONDS} seconds.`;
  }
  return null;
}

function inferRatingTypeFromClock(initialMs, incrementMs) {
  const initialMin = (Number(initialMs) || 0) / 60_000;
  const incSec = (Number(incrementMs) || 0) / 1000;
  const estimated = initialMin + (40 * incSec) / 60;
  if (estimated < 3) return 'bullet';
  if (estimated < 8) return 'blitz';
  if (estimated < 25) return 'rapid';
  return 'classical';
}

/**
 * Preset or custom queue key → full time control for games / Glicko.
 * Custom keys only match others on the same `custom:M+I` string.
 */
export function resolvePlayTimeControl(time) {
  if (typeof time !== 'string') return null;
  const t = time.trim();
  if (!t) return null;
  const preset = getTimeControlByValue(t);
  if (preset) return { ...preset };

  const parsed = parseCustomTimeQueueKey(t);
  if (!parsed) return null;
  const { minutes, incSeconds } = parsed;
  if (
    minutes < CUSTOM_MIN_MINUTES ||
    minutes > CUSTOM_MAX_MINUTES ||
    incSeconds < 0 ||
    incSeconds > CUSTOM_MAX_INCREMENT_SECONDS
  ) {
    return null;
  }
  const initialMs = minutes * 60_000;
  const incrementMs = incSeconds * 1000;
  const ratingType = inferRatingTypeFromClock(initialMs, incrementMs);
  return {
    time: t,
    label: RATING_LABEL[ratingType] || 'Rapid',
    initialMs,
    incrementMs,
    ratingType,
  };
}

export const PLAY_NOTIFICATION_KIND_REMATCH = 'rematch';
export const PLAY_QUEUE_TTL_SECONDS = 60 * 60 * 6;
export const PLAY_GAME_TTL_SECONDS = 60 * 60 * 24 * 7;
export const PLAY_ACTIVE_GAME_TTL_SECONDS = 60 * 60 * 24;

export function getTimeControlByValue(time) {
  return PLAY_TIME_CONTROLS.find((entry) => entry.time === time) || null;
}

export function normalizeTimeControlValue(time) {
  if (resolvePlayTimeControl(time)) return time.trim();
  return null;
}

export function formatClockMs(ms) {
  const safe = Math.max(0, Math.floor(Number(ms) || 0));
  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getQueueLabel(time) {
  const tc = getTimeControlByValue(time);
  if (tc) return `${tc.label} ${tc.time}`;
  const parsed = parseCustomTimeQueueKey(time);
  if (parsed) return `Custom ${parsed.minutes}+${parsed.incSeconds}`;
  return time;
}
