import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseSession, useSessionLoading } from './SessionContext';
import { authedJsonFetch } from './playClient';

const PlayUiContext = createContext({
  status: {
    queue: null,
    activeGame: null,
    unreadNotifications: 0,
    queuePresence: {},
    pendingFriendRequests: 0,
    unreadFeedback: 0,
  },
  loading: false,
  refreshStatus: async () => {},
  joinQueue: async () => {},
  cancelQueue: async () => {},
});

export function PlayUiProvider({ children }) {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const esRef = useRef(null);

  // Used for explicit refreshes (after actions) and initial load
  // No longer called on an interval
  const refreshStatus = useCallback(async () => {
    if (!session) {
      setStatus({ queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} });
      return null;
    }
    setLoading(true);
    try {
      const next = await authedJsonFetch('/api/play/status');
      setStatus({
        queue: next.queue || null,
        activeGame: next.activeGame || null,
        unreadNotifications: Number(next.unreadNotifications) || 0,
        queuePresence: next.queuePresence && typeof next.queuePresence === 'object' ? next.queuePresence : {},
        pendingFriendRequests: Number(next.pendingFriendRequests) || 0,
        unreadFeedback: Number(next.unreadFeedback) || 0,
      });
      return next;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // SSE connection — replaces the setInterval
  useEffect(() => {
    if (!session) {
      setStatus({ queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} });
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      return;
    }

    const token = session.access_token;
    const url = `/api/play/status-stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === 'status_snapshot') {
          const next = payload.status;
          setStatus({
            queue: next.queue || null,
            activeGame: next.activeGame || null,
            unreadNotifications: Number(next.unreadNotifications) || 0,
            queuePresence: next.queuePresence || {},
            pendingFriendRequests: Number(next.pendingFriendRequests) || 0,
            unreadFeedback: Number(next.unreadFeedback) || 0,
          });
        }

        if (payload.type === 'status_update') {
          setStatus((prev) => ({
            ...prev,
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
  }, [session]);

  const joinQueue = useCallback(
    async (time) => {
      if (sessionLoading) return null;
      if (!session?.user) { router.push('/login'); return null; }
      const result = await authedJsonFetch('/api/play/queue', {
        method: 'POST',
        body: JSON.stringify({ time }),
      });
      // SSE will push the update — no need to refreshStatus()
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
    () => ({ status, loading, refreshStatus, joinQueue, cancelQueue }),
    [status, loading, refreshStatus, joinQueue, cancelQueue]
  );

  return <PlayUiContext.Provider value={value}>{children}</PlayUiContext.Provider>;
}

export function usePlayUi() {
  return useContext(PlayUiContext);
}