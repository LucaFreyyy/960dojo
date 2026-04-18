import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import AuthField from '../components/AuthField';
import SectionTitle from '../components/SectionTitle';
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
      <main className="page-shell page-shell--narrow">
        <SectionTitle title="Change Password" />
        <div className="auth-card auth-card--wide changepassword-card">
          <p className="intro-lead">
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
          {error ? <div className="alert alert--error">{error}</div> : null}
          {info ? <div className="alert alert--info">{info}</div> : null}
          <Button
            onClick={submit}
            disabled={!ready || busy}
            variant="primary"
            className="btn--block"
          >
            Update password
          </Button>
          <Link href="/login" className="link">
            Back to sign in
          </Link>
        </div>
      </main>
    </>
  );
}
