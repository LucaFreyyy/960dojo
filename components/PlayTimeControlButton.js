import { useRouter } from 'next/router';
import { usePlayUi } from '../lib/PlayUiContext';

export default function PlayTimeControlButton({ time, label, className = 'time-box' }) {
  const router = useRouter();
  const { status, cancelQueue, joinQueue } = usePlayUi();
  const queueCount = Number(status?.queuePresence?.[time]) || 0;
  const selfInThisQueue = status?.queue?.time === time;
  const othersWaiting = queueCount > (selfInThisQueue ? 1 : 0);
  const btnClassName = `${className} ${othersWaiting ? 'time-box--queued' : ''}`.trim();

  return (
    <button
      type="button"
      className={btnClassName}
      onClick={async () => {
        if (status?.queue) {
          await cancelQueue();
          return;
        }
        const result = await joinQueue(time);
        if (result?.game?.id && (result.game.status === 'active' || result.game.status === 'awaiting_handshake')) {
          router.push(`/play?game=${encodeURIComponent(result.game.id)}`);
        }
      }}
    >
      {time}
      {label ? <small>{label}</small> : null}
    </button>
  );
}
