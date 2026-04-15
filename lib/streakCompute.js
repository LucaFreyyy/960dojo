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
 * @param {{ currentStreak: number, longestStreak: number, playedToday?: boolean, activeFlame?: string }} row
 */
export function activeStreakFlameVariant(row) {
  if (!row || row.currentStreak <= 0) return 'none';
  if (row.playedToday === true) return 'full';
  if (row.playedToday === false) return 'half';
  if (row.activeFlame === 'full' || row.activeFlame === 'half') return row.activeFlame;
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

/** All streak PNGs share this canvas size. */
export const STREAK_SYMBOL_NATIVE_W = 336;
export const STREAK_SYMBOL_NATIVE_H = 742;

/**
 * Piece art by streak count: pawn → bishop → knight → rook → queen → king.
 * Thresholds are minimum days at that tier (inclusive).
 * @type {readonly { min: number, folder: string, nameStem: string }[]}
 */
const STREAK_SYMBOL_TIERS_DESC = [
  { min: 50, folder: '960kings_sprites', nameStem: '960queens_0' },
  { min: 30, folder: '960queens_sprites', nameStem: '960queens_0' },
  { min: 15, folder: '960rooks_sprites', nameStem: '960queens_0' },
  { min: 7, folder: '960knights_sprites', nameStem: '960knights_0' },
  { min: 3, folder: '960bishops_sprites', nameStem: '960queens_0' },
  { min: 1, folder: '960pawns_sprites', nameStem: '960queens_0' },
];

/**
 * @param {number} streakCount
 * @returns {{ min: number, folder: string, nameStem: string } | null}
 */
export function streakSymbolTier(streakCount) {
  if (!Number.isFinite(streakCount) || streakCount < 1) return null;
  for (const tier of STREAK_SYMBOL_TIERS_DESC) {
    if (streakCount >= tier.min) return tier;
  }
  return STREAK_SYMBOL_TIERS_DESC[STREAK_SYMBOL_TIERS_DESC.length - 1];
}

/**
 * @param {'full' | 'half' | 'muted'} variant
 */
function streakVariantSpriteIndex(variant) {
  if (variant === 'muted') return 0;
  if (variant === 'half') return 1;
  return 2;
}

/**
 * @param {number} streakCount
 * @param {'full' | 'half' | 'muted'} variant
 * @returns {string | null}
 */
export function streakSymbolSrc(streakCount, variant) {
  const tier = streakSymbolTier(streakCount);
  if (!tier) return null;
  const idx = streakVariantSpriteIndex(variant);
  return `/streak-symbols/${tier.folder}/${tier.nameStem}_${idx}.png`;
}
