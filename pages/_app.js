import '@/styles/globals.css';
import '@/styles/info.css';
import '@/styles/chessboard.css';
import '@/styles/profile.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    return (
        <SessionContext.Provider value={{ session, loading }}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </SessionContext.Provider>
    );
}