import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { usePlayUi } from '../lib/PlayUiContext';
import { getQueueLabel } from '../lib/playConstants';

export default function PlayStatusBanner() {
  const router = useRouter();
  const { status, cancelQueue } = usePlayUi();
  const prevHadQueueRef = useRef(false);
  const prevActiveGameIdRef = useRef(null);
  const inPlayGameView = router.pathname === '/play' && typeof router.query?.game === 'string' && router.query.game.length > 0;

  useEffect(() => {
    const activeGameId = status?.activeGame?.id || null;
    const hadQueue = prevHadQueueRef.current;
    const prevActive = prevActiveGameIdRef.current;

    if (activeGameId && hadQueue && activeGameId !== prevActive) {
      router.push(`/play?game=${encodeURIComponent(activeGameId)}`);
    }

    prevHadQueueRef.current = Boolean(status?.queue);
    prevActiveGameIdRef.current = activeGameId;
  }, [status?.activeGame?.id, status?.queue, router]);

  if (status?.activeGame && !inPlayGameView) {
    return (
      <>
        <div className="play-status-banner-spacer" aria-hidden />
        <button
          type="button"
          className="play-status-banner play-status-banner--active"
          onClick={() => router.push(`/play?game=${encodeURIComponent(status.activeGame.id)}`)}
        >
          You have an active game in progress. Click to return.
        </button>
      </>
    );
  }

  if (status?.queue) {
    return (
      <>
        <div className="play-status-banner-spacer" aria-hidden />
        <button
          type="button"
          className="play-status-banner play-status-banner--queue"
          onClick={async () => {
            await cancelQueue();
            if (router.pathname === '/play') {
              router.replace('/play');
            }
          }}
        >
          Searching for a {getQueueLabel(status.queue.time)} game. Click to leave the queue.
        </button>
      </>
    );
  }

  return null;
}
