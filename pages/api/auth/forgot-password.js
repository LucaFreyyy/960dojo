import { createClient } from '@supabase/supabase-js';

const supabaseAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function normalizeBaseUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    url.hash = '';
    url.pathname = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(200).json({ success: true });

  try {
    const baseUrl =
      normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL)
      || 'https://www.960dojo.com';
    const redirectTo = `${baseUrl}/changepassword`;
    const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
    );
    void error;
  } catch {}

  // Do not reveal whether account exists.
  return res.status(200).json({ success: true });
}

