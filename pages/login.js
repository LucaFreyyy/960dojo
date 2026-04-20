import Head from 'next/head';
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import AuthField from '../components/AuthField';

function mapSignInErrorMessage(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('email not confirmed') || message.includes('not confirmed')) {
        return 'Not verified yet! Check your email for an activation link!';
    }
    return 'Invalid username or password';
}

export default function LoginPage() {
    const [signInName, setSignInName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [busy, setBusy] = useState(false);
    const signInPasswordRef = useRef(null);
    const signUpEmailRef = useRef(null);
    const signUpPasswordRef = useRef(null);

    const handleSubmit = async () => {
        setError('');
        setInfo('');
        setBusy(true);
        if (!isSignUp) {
            const typedName = signInName.trim();
            if (!typedName) {
                setBusy(false);
                return setError('Username is required');
            }
            const { data: found, error: lookupError } = await supabase
                .from('User')
                .select('email')
                .eq('name', typedName)
                .maybeSingle();
            if (lookupError || !found?.email) {
                setBusy(false);
                return setError('Invalid username or password');
            }
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: found.email,
                password,
            });
            if (signInError) {
                setBusy(false);
                return setError(mapSignInErrorMessage(signInError));
            }
        } else {
            if (!username.trim()) {
                setBusy(false);
                return setError('Username is required');
            }

            const { data: existing } = await supabase
                .from('User')
                .select('id')
                .eq('name', username.trim())
                .maybeSingle();

            if (existing) {
                setBusy(false);
                return setError('Username already taken');
            }

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username: username.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setBusy(false);
                return setError(data.error);
            }
            setBusy(false);
            setError('');
            setInfo(
                `We sent a verification link to ${email.trim()}. Please check your inbox and your spam/junk folder too. Open it to activate your account.`
            );
            setPassword('');
            return;
        }
        setBusy(false);
        window.location.href = '/';
    };

    const handleForgotPassword = async () => {
        setError('');
        setInfo('');
        setBusy(true);
        await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail.trim() }),
        }).catch(() => {});
        setBusy(false);
        setInfo('If an account exists for that email, we sent a password reset link.');
    };

    return (
        <>
            <Head>
                <title>{forgotMode ? 'Forgot Password' : isSignUp ? 'Create Account' : 'Sign In'} - 960 Dojo</title>
            </Head>
            <main className="page-shell--auth">
                <div className="auth-card auth-card--wide">
                    <h2 className="auth-card-title">
                        {forgotMode ? 'Forgot Password' : isSignUp ? 'Create Account' : 'Sign In'}
                    </h2>

                    {forgotMode ? (
                        <>
                            <AuthField
                                label="Email"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                autoComplete="email"
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleForgotPassword();
                                }}
                            />
                            <Button
                                onClick={handleForgotPassword}
                                disabled={busy}
                                variant="primary"
                                className="btn--block"
                            >
                                Send reset link
                            </Button>
                        </>
                    ) : isSignUp ? (
                        <>
                            <AuthField
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') signUpEmailRef.current?.focus();
                                }}
                            />
                            <AuthField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                inputRef={signUpEmailRef}
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') signUpPasswordRef.current?.focus();
                                }}
                            />
                            <AuthField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                inputRef={signUpPasswordRef}
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmit();
                                }}
                            />
                            <Button
                                onClick={handleSubmit}
                                disabled={busy}
                                variant="primary"
                                className="btn--block"
                            >
                                Sign Up
                            </Button>
                        </>
                    ) : (
                        <>
                            <AuthField
                                label="Username"
                                value={signInName}
                                onChange={(e) => setSignInName(e.target.value)}
                                autoComplete="username"
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') signInPasswordRef.current?.focus();
                                }}
                            />
                            <AuthField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                inputRef={signInPasswordRef}
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmit();
                                }}
                            />
                            <Button
                                onClick={handleSubmit}
                                disabled={busy}
                                variant="primary"
                                className="btn--block"
                            >
                                Sign In
                            </Button>
                        </>
                    )}

                    {error ? <div className="alert alert--error">{error}</div> : null}
                    {info ? <div className="alert alert--info">{info}</div> : null}

                    {!forgotMode ? (
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => {
                                setIsSignUp((v) => !v);
                                setError('');
                                setInfo('');
                            }}
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                            setForgotMode((v) => !v);
                            setError('');
                            setInfo('');
                        }}
                    >
                        {forgotMode ? 'Back to sign in' : 'Forgot password?'}
                    </button>
                </div>
            </main>
        </>
    );
}
