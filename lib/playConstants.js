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
  { time: '30+20', label: 'Classical', initialMs: 1_800_000, incrementMs: 20_000, ratingType: 'classical' },
];

export const PLAY_NOTIFICATION_KIND_REMATCH = 'rematch';
export const PLAY_QUEUE_TTL_SECONDS = 60 * 60 * 6;
export const PLAY_GAME_TTL_SECONDS = 60 * 60 * 24 * 7;
export const PLAY_ACTIVE_GAME_TTL_SECONDS = 60 * 60 * 24;

export function getTimeControlByValue(time) {
  return PLAY_TIME_CONTROLS.find((entry) => entry.time === time) || null;
}

export function normalizeTimeControlValue(time) {
  return getTimeControlByValue(time)?.time || null;
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
  return tc ? `${tc.label} ${tc.time}` : time;
}
