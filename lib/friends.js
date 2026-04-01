import { supabase } from './supabase';

export async function fetchFriendsForUser(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('FriendRequest')
    .select('requesterId, receiverId')
    .eq('status', 'accepted')
    .or(`requesterId.eq.${userId},receiverId.eq.${userId}`);
  if (error || !data) return [];
  const friendIds = data.map((r) => (r.requesterId === userId ? r.receiverId : r.requesterId));
  if (!friendIds.length) return [];
  const { data: users } = await supabase.from('User').select('id, name').in('id', friendIds);
  return users || [];
}

export async function fetchFriendshipRow(a, b) {
  if (!a || !b || a === b) return null;
  const { data } = await supabase
    .from('FriendRequest')
    .select('id, requesterId, receiverId, status')
    .or(`and(requesterId.eq.${a},receiverId.eq.${b}),and(requesterId.eq.${b},receiverId.eq.${a})`)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export async function sendFriendRequest(requesterId, receiverId) {
  if (!requesterId || !receiverId || requesterId === receiverId) {
    return { ok: false, code: 'invalid' };
  }

  // Prevent duplicate requests in either direction.
  const existing = await fetchFriendshipRow(requesterId, receiverId);
  if (existing) {
    return { ok: false, code: 'exists', row: existing };
  }

  const { error } = await supabase.from('FriendRequest').insert({
    id: crypto.randomUUID(),
    requesterId,
    receiverId,
    status: 'pending',
  });

  if (!error) return { ok: true };
  if (error.code === '42501') return { ok: false, code: 'forbidden' };
  if (error.code === '23505') return { ok: false, code: 'exists' };
  return { ok: false, code: 'unknown', error };
}

