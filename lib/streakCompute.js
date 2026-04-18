/**
 * Daily play streaks use distinct calendar days in UTC derived from `finished` timestamps.
 */

/** @param {string} yyyyMmDd */
export function addDaysUtc(yyyyMmDd, deltaDays) {
  const [y, m, d] = yyyyMmDd.split('-').map((n) => Number(n));
  const ms = Date.UTC(y, m - 1, d + deltaDays);
  return new Date(ms).toISOString().slice(0, 10);
}

export function todayUtcDateString() {
  return new Date().toISOString().slice(0, 10);
}

/** @param {string | Date} isoOrDate */
export function toUtcDateString(isoOrDate) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * @param {string[]} sortedUniqueDates ascending YYYY-MM-DD
 * @returns {number}
 */
export function longestConsecutiveIsland(sortedUniqueDates) {
  if (!sortedUniqueDates.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedUniqueDates.length; i++) {
    if (addDaysUtc(sortedUniqueDates[i - 1], 1) === sortedUniqueDates[i]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

/**
 * @param {Iterable<string>} finishedIsoList
 * @param {string} [todayUtc]
 */
export function collectSortedUtcActivityDates(finishedIsoList, todayUtc = todayUtcDateString()) {
  const set = new Set();
  for (const iso of finishedIsoList) {
    const day = toUtcDateString(iso);
    if (day) set.add(day);
  }
  return [...set].sort();
}

/**
 * @param {string[]} sortedUniqueDates
 * @param {string} todayUtc
 */
export function computeStreakState(sortedUniqueDates, todayUtc = todayUtcDateString()) {
  if (!sortedUniqueDates.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      playedToday: false,
      lastActivityDate: null,
      activeFlame: 'none',
    };
  }

  const longestStreak = Math.max(
    longestConsecutiveIsland(sortedUniqueDates),
    0
  );

  const hasToday = sortedUniqueDates.includes(todayUtc);
  const yesterday = addDaysUtc(todayUtc, -1);
  const hasYesterday = sortedUniqueDates.includes(yesterday);

  let anchor = null;
  if (hasToday) anchor = todayUtc;
  else if (hasYesterday) anchor = yesterday;

  if (!anchor) {
    return {
      currentStreak: 0,
      longestStreak,
      playedToday: false,
      lastActivityDate: sortedUniqueDates[sortedUniqueDates.length - 1],
      activeFlame: 'none',
    };
  }

  const daySet = new Set(sortedUniqueDates);
  let current = 0;
  let d = anchor;
  while (daySet.has(d)) {
    current += 1;
    d = addDaysUtc(d, -1);
  }

  const lastActivityDate = sortedUniqueDates[sortedUniqueDates.length - 1];

  let activeFlame = 'none';
  if (current > 0) {
    activeFlame = hasToday ? 'full' : 'half';
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longestStreak, current),
    playedToday: hasToday,
    lastActivityDate,
    activeFlame,
  };
}

/**
 * @param {{ currentStreak: number, longestStreak: number, lastActivityDate?: string|null, activeFlame?: string }} row
 */
export function activeStreakFlameVariant(row) {
  const normalized = normalizePersistedStreakRow(row);
  if (!normalized || normalized.currentStreak <= 0) return 'none';
  if (normalized.playedToday === true) return 'full';
  if (normalized.playedToday === false) return 'half';
  if (normalized.activeFlame === 'full' || normalized.activeFlame === 'half') return normalized.activeFlame;
  return 'full';
}

/**
 * Longest-only badge (grey) when longest beats current.
 * @param {{ currentStreak: number, longestStreak: number }} row
 */
export function recordStreakFlameVariant(row) {
  if (!row || row.longestStreak <= 0) return 'none';
  if (row.longestStreak > row.currentStreak) return 'muted';
  return 'none';
}

/**
 * Normalize persisted streak rows against current UTC day.
 * - Keep half flame only when last activity is yesterday.
 * - Reset current streak to 0 when a full UTC day is missed.
 * - Derive playedToday from lastActivityDate.
 * @param {{ currentStreak?: number, longestStreak?: number, lastActivityDate?: string|null, activeFlame?: string }} row
 * @param {string} [todayUtc]
 */
export function normalizePersistedStreakRow(row, todayUtc = todayUtcDateString()) {
  if (!row) return null;
  const lastActivityDate = typeof row.lastActivityDate === 'string' ? row.lastActivityDate : null;
  const yesterdayUtc = addDaysUtc(todayUtc, -1);
  const isToday = lastActivityDate === todayUtc;
  const isYesterday = lastActivityDate === yesterdayUtc;
  const storedCurrent = Math.max(0, Number(row.currentStreak) || 0);
  const longestStreak = Math.max(0, Number(row.longestStreak) || 0);
  const playedToday = isToday;

  let currentStreak = storedCurrent;
  if (!isToday && !isYesterday) currentStreak = 0;

  return {
    ...row,
    currentStreak,
    longestStreak,
    playedToday,
    lastActivityDate,
    activeFlame: currentStreak > 0 ? (playedToday ? 'full' : 'half') : 'none',
  };
}
