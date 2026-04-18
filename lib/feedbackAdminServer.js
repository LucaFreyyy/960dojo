import { createClient } from '@supabase/supabase-js';
import { hashEmail } from './hashEmail';
import { createSupabaseAdmin } from './supabaseAdmin';
import { FEEDBACK_ADMIN_USERNAME } from './feedbackAdminConstants';

export async function getBearerAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);
  if (error || !user?.email) return null;
  const userId = await hashEmail(user.email);
  return { user, userId };
}

export async function userIdIsFeedbackAdmin(userId) {
  if (!userId) return false;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from('User').select('name').eq('id', userId).maybeSingle();
  return data?.name === FEEDBACK_ADMIN_USERNAME;
}
