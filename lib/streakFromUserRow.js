/** Normalize embedded `Streak` from a `User` select (object or one-element array). */
export function streakFromUserRow(userRow) {
  if (!userRow) return null;
  const raw = userRow.Streak;
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) return null;
  const todayUtc = new Date().toISOString().slice(0, 10);
  const lastActivityDate = row.lastActivityDate || null;
  return {
    currentStreak: Number(row.currentStreak) || 0,
    longestStreak: Number(row.longestStreak) || 0,
    playedToday: lastActivityDate === todayUtc,
    lastActivityDate,
  };
}
