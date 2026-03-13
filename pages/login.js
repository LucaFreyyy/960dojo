import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (isSignUp) {
            if (!username.trim()) return setError('Username is required');

            const { data: existing } = await supabase
                .from('User')
                .select('id')
                .eq('name', username.trim())
                .maybeSingle();

            if (existing) return setError('Username already taken');

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username: username.trim() }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            await supabase.auth.signInWithPassword({ email, password });
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return setError(error.message);
        }
        window.location.href = '/';
    };

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {isSignUp && (
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={handleSubmit}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
            <a onClick={() => setIsSignUp(!isSignUp)} style={{ cursor: 'pointer' }}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </a>
        </div>
    );
}