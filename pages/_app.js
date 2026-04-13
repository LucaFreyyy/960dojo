import '@/styles/app.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import Layout from '../components/Layout';
import { hashEmail } from '../lib/hashEmail';
import { fetchUserSettings } from '../lib/openingsDb';
import { BoardVisualsContext } from '../lib/BoardVisualsContext';
import { normalizeBoardTheme, normalizePieceSet } from '../lib/boardVisuals';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardVisuals, setBoardVisuals] = useState({ pieceSet: 'cburnett', boardTheme: 'brown' });

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

  useEffect(() => {
    const email = session?.user?.email || null;
    if (!email) {
      setBoardVisuals({ pieceSet: 'cburnett', boardTheme: 'brown' });
      return;
    }
    (async () => {
      const id = await hashEmail(email).catch(() => null);
      if (!id) return;
      const s = await fetchUserSettings(id);
      if (!s) return;
      setBoardVisuals({
        pieceSet: normalizePieceSet(s.piece_set),
        boardTheme: normalizeBoardTheme(s.board),
      });
    })();
  }, [session?.user?.email]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      <BoardVisualsContext.Provider value={{ ...boardVisuals, setBoardVisuals }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </BoardVisualsContext.Provider>
    </SessionContext.Provider>
  );
}
