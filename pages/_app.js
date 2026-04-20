import '@/styles/app.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import Layout from '../components/Layout';
import { hashEmail } from '../lib/hashEmail';
import { fetchUserSettings } from '../lib/openingsDb';
import { BoardVisualsContext } from '../lib/BoardVisualsContext';
import { PlayUiProvider } from '../lib/PlayUiContext';
import { normalizeBoardTheme, normalizePieceSet } from '../lib/boardVisuals';
import { normalizeUiStyle } from '../lib/uiStyles';

import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

const BOARD_VISUALS_STORAGE_KEY = 'dojo.boardVisuals.v1';
const DEFAULT_BOARD_VISUALS = {
  pieceSet: 'cburnett',
  boardTheme: 'brown',
  uiStyle: 'dojo-classic',
};

function readBoardVisualsFromStorage() {
  if (typeof window === 'undefined') return DEFAULT_BOARD_VISUALS;
  try {
    const raw = window.localStorage.getItem(BOARD_VISUALS_STORAGE_KEY);
    if (!raw) return DEFAULT_BOARD_VISUALS;
    const parsed = JSON.parse(raw);
    return {
      pieceSet: normalizePieceSet(parsed?.pieceSet),
      boardTheme: normalizeBoardTheme(parsed?.boardTheme),
      uiStyle: normalizeUiStyle(parsed?.uiStyle),
    };
  } catch {
    return DEFAULT_BOARD_VISUALS;
  }
}

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardVisuals, setBoardVisuals] = useState(readBoardVisualsFromStorage);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        // Invalid/missing refresh tokens can happen after account creation/login churn.
        // Treat as signed out and let the normal sign-in flow proceed.
        setSession(null);
      })
      .finally(() => {
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
        uiStyle: normalizeUiStyle(s.style),
      });
    })();
  }, [session?.user?.email]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-ui-style', normalizeUiStyle(boardVisuals.uiStyle));
  }, [boardVisuals.uiStyle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        BOARD_VISUALS_STORAGE_KEY,
        JSON.stringify({
          pieceSet: normalizePieceSet(boardVisuals.pieceSet),
          boardTheme: normalizeBoardTheme(boardVisuals.boardTheme),
          uiStyle: normalizeUiStyle(boardVisuals.uiStyle),
        })
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [boardVisuals]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      <PlayUiProvider>
        <BoardVisualsContext.Provider value={{ ...boardVisuals, setBoardVisuals }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </BoardVisualsContext.Provider>
      </PlayUiProvider>
    </SessionContext.Provider>
  );
}
