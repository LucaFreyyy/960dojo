import Button from './Button';

export function NextPuzzleBtn({ onClick, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="tactic-next" className="btn--block">
      Next Puzzle
    </Button>
  );
}

export function OpenInLichessBtn({ onClick, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="tactic-lichess" className="btn--block">
      Open In Lichess
    </Button>
  );
}

export function ThumbsUpBtn({ onClick, active = false, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="thumb"
      className={`btn--thumb btn--thumb-up ${active ? 'btn--thumb-up-active' : ''}`.trim()}
    >
      Up
    </Button>
  );
}

export function ThumbsDownBtn({ onClick, active = false, disabled = false }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="thumb"
      className={`btn--thumb ${active ? 'btn--thumb-down-active' : ''}`.trim()}
    >
      Down
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
    <div className="post-tactic">
      <div className="post-tactic__title">{solved ? 'Solved' : 'Failed'}</div>
      {lichessUrl ? <OpenInLichessBtn onClick={onOpenInLichess} disabled={disabled} /> : null}
      <div className="post-tactic__thumbs">
        <ThumbsUpBtn onClick={onLike} active={likeChoice === true} disabled={disabled} />
        <ThumbsDownBtn onClick={onDislike} active={likeChoice === false} disabled={disabled} />
      </div>
      <div className="post-tactic__lichess-note">
        <NextPuzzleBtn onClick={onNextPuzzle} disabled={disabled} />
      </div>
    </div>
  );
}
