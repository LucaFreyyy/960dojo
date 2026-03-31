import Button from './Button';

export function NextPuzzleBtn({ onClick, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{ width: '100%', background: '#10b981', border: '1px solid #059669', color: '#fff', fontWeight: 800 }}
    >
      Next Puzzle
    </Button>
  );
}

export function OpenInLichessBtn({ onClick, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{ width: '100%', background: '#2563eb', border: '1px solid #1d4ed8', color: '#fff', fontWeight: 800 }}
    >
      Open In Lichess
    </Button>
  );
}

export function ThumbsUpBtn({ onClick, active = false, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: active ? '#16a34a' : '#1f2937',
        border: '1px solid #334155',
        color: '#fff',
        fontWeight: 800,
      }}
    >
      👍
    </Button>
  );
}

export function ThumbsDownBtn({ onClick, active = false, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: active ? '#dc2626' : '#1f2937',
        border: '1px solid #334155',
        color: '#fff',
        fontWeight: 800,
      }}
    >
      👎
    </Button>
  );
}

export default function PostTacticDisplay({
  visible,
  solved,
  likeChoice,
  onLike,
  onDislike,
  onOpenInLichess,
  onNextPuzzle,
  lichessUrl,
  disabled = false,
}) {
  if (!visible) return null;

  return (
    <div style={{ marginTop: 12, background: '#111827', borderRadius: 12, padding: '0.9rem', color: '#e5e7eb' }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{solved ? 'Solved' : 'Failed'}</div>
      {lichessUrl ? <OpenInLichessBtn onClick={onOpenInLichess} disabled={disabled} /> : null}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <ThumbsUpBtn onClick={onLike} active={likeChoice === true} disabled={disabled} />
        <ThumbsDownBtn onClick={onDislike} active={likeChoice === false} disabled={disabled} />
      </div>
      <div style={{ marginTop: 10 }}>
        <NextPuzzleBtn onClick={onNextPuzzle} disabled={disabled} />
      </div>
    </div>
  );
}

