import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
      setStatus({
        queue: null,
        activeGame: null,
        unreadNotifications: 0,
        queuePresence: {},
        pendingFriendRequests: 0,
        unreadFeedback: 0,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refreshStatus();
    if (!session) return undefined;
    const timer = window.setInterval(refreshStatus, 2500);
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshStatus();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [session, refreshStatus]);

  const joinQueue = useCallback(
    async (time) => {
      if (sessionLoading) return null;
      if (!session?.user) {
        router.push('/login');
        return null;
      }
      const result = await authedJsonFetch('/api/play/queue', {
        method: 'POST',
        body: JSON.stringify({ time }),
      });
      await refreshStatus();
      return result;
    },
    [refreshStatus, session?.user, sessionLoading, router]
  );

  const cancelQueue = useCallback(async () => {
    if (sessionLoading) return null;
    if (!session?.user) {
      router.push('/login');
      return null;
    }
    const result = await authedJsonFetch('/api/play/queue', { method: 'DELETE' });
    await refreshStatus();
    return result;
  }, [refreshStatus, session?.user, sessionLoading, router]);

  const value = useMemo(
    () => ({ status, loading, refreshStatus, joinQueue, cancelQueue }),
    [status, loading, refreshStatus, joinQueue, cancelQueue]
  );

  return <PlayUiContext.Provider value={value}>{children}</PlayUiContext.Provider>;
}

export function usePlayUi() {
  return useContext(PlayUiContext);
}
