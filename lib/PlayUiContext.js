import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSupabaseSession } from './SessionContext';
import { authedJsonFetch } from './playClient';

const PlayUiContext = createContext({
  status: { queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} },
  loading: false,
  refreshStatus: async () => {},
  joinQueue: async () => {},
  cancelQueue: async () => {},
});

export function PlayUiProvider({ children }) {
  const session = useSupabaseSession();
  const [status, setStatus] = useState({ queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} });
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
      });
      return next;
    } catch {
      setStatus({ queue: null, activeGame: null, unreadNotifications: 0, queuePresence: {} });
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refreshStatus();
    if (!session) return undefined;
    const timer = window.setInterval(refreshStatus, 5000);
    return () => window.clearInterval(timer);
  }, [session, refreshStatus]);

  const joinQueue = useCallback(
    async (time) => {
      const result = await authedJsonFetch('/api/play/queue', {
        method: 'POST',
        body: JSON.stringify({ time }),
      });
      await refreshStatus();
      return result;
    },
    [refreshStatus]
  );

  const cancelQueue = useCallback(async () => {
    const result = await authedJsonFetch('/api/play/queue', { method: 'DELETE' });
    await refreshStatus();
    return result;
  }, [refreshStatus]);

  const value = useMemo(
    () => ({ status, loading, refreshStatus, joinQueue, cancelQueue }),
    [status, loading, refreshStatus, joinQueue, cancelQueue]
  );

  return <PlayUiContext.Provider value={value}>{children}</PlayUiContext.Provider>;
}

export function usePlayUi() {
  return useContext(PlayUiContext);
}
