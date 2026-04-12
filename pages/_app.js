import '@/styles/app.css';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import Layout from '../components/Layout';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

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

  useEffect(() => {
    let cancelled = false;
    import('../lib/stockfishUtils').then((mod) => {
      if (!cancelled) mod.warmStockfish();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      <Head>
        <link rel="preload" href="/stockfish-18.wasm" as="fetch" crossOrigin="anonymous" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContext.Provider>
  );
}
