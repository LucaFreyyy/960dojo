import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import AuthField from '../components/AuthField';
import { supabase } from '../lib/supabase';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setReady(Boolean(data?.session));
      if (!data?.session) {
        setInfo('Use the reset link from your email to open this page.');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const submit = async () => {
    setError('');
    setInfo('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    setInfo('Password updated. You can now sign in.');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <Head>
        <title>Change Password - 960 Dojo</title>
      </Head>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <section className="practice" style={{ margin: '0 0 0.75rem', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Change Password</h2>
        </section>
        <div
          style={{
            maxWidth: 460,
            margin: '0 auto',
            background: '#111827',
            border: '1px solid #334155',
            borderRadius: 14,
            padding: '1.15rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
            Enter a new password for your account.
          </p>
          <AuthField
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={!ready || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRef.current?.focus();
            }}
          />
          <AuthField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            inputRef={confirmRef}
            disabled={!ready || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
          {error ? <div style={{ color: '#f87171', fontSize: 13, fontWeight: 700 }}>{error}</div> : null}
          {info ? <div style={{ color: '#93c5fd', fontSize: 13, fontWeight: 700 }}>{info}</div> : null}
          <Button
            onClick={submit}
            disabled={!ready || busy}
            style={{ width: '100%', background: '#2563eb', color: '#fff', border: '1px solid #1d4ed8', fontWeight: 800 }}
          >
            Update password
          </Button>
          <Link href="/login" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Back to sign in
          </Link>
        </div>
      </main>
    </>
  );
}

