import { normalizePersistedStreakRow } from './streakCompute';

/** Normalize embedded `Streak` from a `User` select (object or one-element array). */
export function streakFromUserRow(userRow) {
  if (!userRow) return null;
  const raw = userRow.Streak;
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) return null;
  return normalizePersistedStreakRow(row);
}
