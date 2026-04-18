import { supabase } from './supabase';

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function authedJsonFetch(url, options = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('You need to be signed in for live play.');
  }
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, {
    ...options,
    headers,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  if (!res.ok) {
    throw new Error(json?.error || `Request failed: ${res.status}`);
  }
  return json;
}
