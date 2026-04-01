import { supabase } from './supabase';

export async function fetchUnfinishedOpeningRow(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('UserOpening')
    .select('id, openingNr, color, pgn, evalHistory')
    .eq('userId', userId)
    .is('finished', null)
    .maybeSingle();

  if (error) {
    console.error('[fetchUnfinishedOpeningRow]', error);
    return null;
  }
  return data;
}

export async function insertUserOpening(row) {
  const { error } = await supabase.from('UserOpening').insert(row);
  if (error) console.error('[insertUserOpening]', error);
  return !error;
}

export async function updateUserOpening(id, patch) {
  const { error } = await supabase.from('UserOpening').update(patch).eq('id', id);
  if (error) console.error('[updateUserOpening]', error);
  return !error;
}

export async function countOpeningsRatings(userId) {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('Rating')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('type', 'openings');

  if (error) {
    console.error('[countOpeningsRatings]', error);
    return 0;
  }
  return count || 0;
}

export async function fetchLatestOpeningsRating(userId) {
  if (!userId) return 1500;
  const { data, error } = await supabase
    .from('Rating')
    .select('value')
    .eq('userId', userId)
    .eq('type', 'openings')
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 1500;
  return Number(data.value) || 1500;
}
