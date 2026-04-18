import { createSupabaseAdmin } from './supabaseAdmin';
import { userIdIsFeedbackAdmin } from './feedbackAdminServer';

/** Friend requests + feedback inbox counts for the header menu (same auth as /api/play/status). */
export async function getSocialNotificationBadgeCounts(userId) {
  const admin = createSupabaseAdmin();
  const [{ count: friendCount, error: friendErr }, isFeedbackAdmin] = await Promise.all([
    admin
      .from('FriendRequest')
      .select('id', { count: 'exact', head: true })
      .eq('receiverId', userId)
      .eq('status', 'pending'),
    userIdIsFeedbackAdmin(userId),
  ]);

  let unreadFeedback = 0;
  if (isFeedbackAdmin) {
    const { count, error } = await admin
      .from('Feedback')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    if (!error) unreadFeedback = count ?? 0;
  }

  return {
    pendingFriendRequests: friendErr ? 0 : friendCount ?? 0,
    unreadFeedback,
  };
}
