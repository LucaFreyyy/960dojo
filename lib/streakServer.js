import { addDaysUtc, todayUtcDateString } from './streakCompute';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseAdmin
 * @param {string} userId
 */
export async function refreshUserStreakInDb(supabaseAdmin, userId) {
  if (!userId) return { ok: false, error: 'missing userId' };

  const todayUtc = todayUtcDateString();
  const yesterdayUtc = addDaysUtc(todayUtc, -1);

  const { data: existing, error: exErr } = await supabaseAdmin
    .from('Streak')
    .select('currentStreak, longestStreak, lastActivityDate, playedToday')
    .eq('userId', userId)
    .maybeSingle();

  if (exErr) return { ok: false, error: exErr.message };

  const prevCurrent = Number(existing?.currentStreak) || 0;
  const prevLongest = Number(existing?.longestStreak) || 0;
  const prevLastActivityDate = existing?.lastActivityDate || null;
  // Derive "played today" from the activity date only.
  // Do not trust stored playedToday for streak math, because it may be stale if daily reset has not run yet.
  const prevPlayedToday = prevLastActivityDate === todayUtc;

  let nextCurrent = prevCurrent;
  if (prevLastActivityDate === todayUtc || prevPlayedToday) {
    // Already counted for today; keep streak length unchanged.
    nextCurrent = prevCurrent > 0 ? prevCurrent : 1;
  } else if (prevLastActivityDate === yesterdayUtc) {
    nextCurrent = Math.max(1, prevCurrent + 1);
  } else {
    nextCurrent = 1;
  }

  const nextLongest = Math.max(prevLongest, nextCurrent);

  const payload = {
    userId,
    currentStreak: nextCurrent,
    longestStreak: nextLongest,
    lastActivityDate: todayUtc,
    playedToday: true,
    updatedAt: new Date().toISOString(),
  };

  const { error: upErr } = await supabaseAdmin.from('Streak').upsert(payload, {
    onConflict: 'userId',
  });

  if (upErr) return { ok: false, error: upErr.message };
  return {
    ok: true,
    currentStreak: nextCurrent,
    longestStreak: nextLongest,
    lastActivityDate: todayUtc,
    playedToday: true,
  };
}
