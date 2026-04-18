import { createClient } from '@supabase/supabase-js';
import { hashEmail } from './hashEmail';

let supabaseAuthClient = null;

function getSupabaseAuthClient() {
  if (supabaseAuthClient) return supabaseAuthClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  supabaseAuthClient = createClient(url, key);
  return supabaseAuthClient;
}

export async function getAuthUserFromToken(token) {
  if (!token) return null;
  const supabaseAuth = getSupabaseAuthClient();
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (!error && user?.email) {
    const userId = await hashEmail(user.email);
    return { user, userId, token };
  }

  // Some server contexts can surface "Auth session missing" even with a JWT passed in.
  // Fallback to direct Auth API verification so bearer-protected APIs remain reliable.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    const fallbackUser = await response.json();
    if (!fallbackUser?.email) return null;
    const userId = await hashEmail(fallbackUser.email);
    return { user: fallbackUser, userId, token };
  } catch {
    return null;
  }
}

export async function getBearerAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return getAuthUserFromToken(authHeader.slice(7));
}
