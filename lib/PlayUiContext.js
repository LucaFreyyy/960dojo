import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseSession, useSessionLoading } from './SessionContext';
import { authedJsonFetch } from './playClient';
import { playPlayMatchedSound } from './soundEffects';

const PlayUiContext = createContext({
  status: {
    queue: null,
    activeGame: null,
    unreadNotifications: 0,
    queuePresence: {},
    pendingFriendRequests: 0,
    unreadFeedback: 0,
  },
  joinQueue: async () => {},
  cancelQueue: async () => {},
});

export function PlayUiProvider({ children }) {
  const router = useRouter();
  const isPlayRoute = router.pathname === '/play';
  const session = useSupabaseSession();
  const sessionLoading = useSessionLoading();
  const [status, setStatus] = useState({
    queue: null,
    activeGame: null,
    unreadNotifications: 0,
    queuePresence: {},
    pendingFriendRequests: 0,
    unreadFeedback: 0,
  });
  const esRef = useRef(null);
  const matchBlinkTimerRef = useRef(null);
  const matchBlinkUntilRef = useRef(0);
  const baseTitleRef = useRef('');

  const stopMatchBlink = useCallback(() => {
    if (matchBlinkTimerRef.current) {
      window.clearInterval(matchBlinkTimerRef.current);
      matchBlinkTimerRef.current = null;
    }
    if (baseTitleRef.current) {
      document.title = baseTitleRef.current;
    }
  }, []);

  const maybeNotifyMatchFound = useCallback((nextActiveGame) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    playPlayMatchedSound();

    if (document.hidden && typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        try {
          const n = new Notification('960 Dojo', {
            body: 'Match found. Your game is ready.',
            tag: nextActiveGame?.id ? `play-match-${nextActiveGame.id}` : 'play-match',
            renotify: true,
          });
          n.onclick = () => {
            try {
              window.focus();
            } catch {}
          };
        } catch {}
      } else if (Notification.permission === 'default') {
        // Best effort; browser may ignore without user gesture.
        Notification.requestPermission().catch(() => {});
      }
    }

    if (!document.hidden) return;
    if (!baseTitleRef.current) {
      baseTitleRef.current = document.title || '960 Dojo';
    }
    matchBlinkUntilRef.current = Date.now() + 15_000;
    if (matchBlinkTimerRef.current) return;
    let onAlert = false;
    matchBlinkTimerRef.current = window.setInterval(() => {
      if (!document.hidden || Date.now() >= matchBlinkUntilRef.current) {
        stopMatchBlink();
        return;
      }
      onAlert = !onAlert;
      document.title = onAlert ? 'Match found! Join now' : baseTitleRef.current;
    }, 850);
  }, [stopMatchBlink]);

  const applyNextStatus = useCallback((prev, nextPatch) => {
    const next = {
      ...prev,
      ...nextPatch,
    };
    const prevQueueTime = prev?.queue?.time || null;
    const nextQueueTime = next?.queue?.time || null;
    const prevActiveGameId = prev?.activeGame?.id || null;
    const nextActiveGameId = next?.activeGame?.id || null;
    const becameMatched =
      Boolean(prevQueueTime) &&
      !nextQueueTime &&
      Boolean(nextActiveGameId) &&
      nextActiveGameId !== prevActiveGameId;
    if (becameMatched) {
      maybeNotifyMatchFound(next.activeGame);
    }
    return next;
  }, [maybeNotifyMatchFound]);

  // SSE connection — replaces the setInterval
  useEffect(() => {
    if (!session) {
      setStatus({ queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} });
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      return;
    }

    const token = session.access_token;
    const url = `/api/play/status-stream?token=${encodeURIComponent(token)}&includeQueuePresence=${isPlayRoute ? '1' : '0'}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === 'status_snapshot') {
          const next = payload.status;
          const mapped = {
            queue: next.queue || null,
            activeGame: next.activeGame || null,
            unreadNotifications: Number(next.unreadNotifications) || 0,
            queuePresence: next.queuePresence || {},
            pendingFriendRequests: Number(next.pendingFriendRequests) || 0,
            unreadFeedback: Number(next.unreadFeedback) || 0,
          };
          setStatus((prev) => applyNextStatus(prev, mapped));
        }

        if (payload.type === 'status_update') {
          setStatus((prev) => applyNextStatus(prev, {
            ...(payload.queue !== undefined && { queue: payload.queue }),
            ...(payload.activeGame !== undefined && { activeGame: payload.activeGame }),
            ...(payload.unreadNotifications !== undefined && {
              unreadNotifications: Number(payload.unreadNotifications),
            }),
          }));
        }
      } catch {}
    };

    es.onerror = () => {
      // EventSource auto-reconnects — no action needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [session, applyNextStatus, isPlayRoute]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    baseTitleRef.current = document.title || '960 Dojo';
    const onVisible = () => {
      if (!document.hidden) stopMatchBlink();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      stopMatchBlink();
    };
  }, [stopMatchBlink]);

  const joinQueue = useCallback(
    async (time) => {
      if (sessionLoading) return null;
      if (!session?.user) { router.push('/login'); return null; }
      const result = await authedJsonFetch('/api/play/queue', {
        method: 'POST',
        body: JSON.stringify({ time }),
      });
      return result;
    },
    [session?.user, sessionLoading, router]
  );

  const cancelQueue = useCallback(async () => {
    if (sessionLoading) return null;
    if (!session?.user) { router.push('/login'); return null; }
    const result = await authedJsonFetch('/api/play/queue', { method: 'DELETE' });
    // SSE will push the update
    return result;
  }, [session?.user, sessionLoading, router]);

  const value = useMemo(
    () => ({ status, joinQueue, cancelQueue }),
    [status, joinQueue, cancelQueue]
  );

  return <PlayUiContext.Provider value={value}>{children}</PlayUiContext.Provider>;
}

export function usePlayUi() {
  return useContext(PlayUiContext);
}