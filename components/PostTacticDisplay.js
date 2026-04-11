import { useId } from 'react';
import { HiOutlineHandThumbDown, HiOutlineHandThumbUp } from 'react-icons/hi2';
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

export function OpenInAnalysisBtn({ onClick, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="tactic-analysis" className="btn--block">
      Open in analysis
    </Button>
  );
}

export function OpenLichessGameBtn({ onClick, disabled = false }) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="tactic-lichess" className="btn--block">
      Open game
    </Button>
  );
}

export function ThumbsUpBtn({ onClick, active = false, disabled = false, roughFilterId }) {
  return (
    <button
      type="button"
      className={`thumb-btn thumb-btn--up ${active ? 'thumb-btn--up-active' : ''}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Remove good rating' : 'Rate puzzle good'}
    >
      <span
        className="thumb-btn__icon-wrap"
        style={roughFilterId ? { filter: `url(#${roughFilterId})` } : undefined}
      >
        <HiOutlineHandThumbUp className="thumb-btn__glyph" size={28} strokeWidth={2.25} />
      </span>
    </button>
  );
}

export function ThumbsDownBtn({ onClick, active = false, disabled = false, roughFilterId }) {
  return (
    <button
      type="button"
      className={`thumb-btn thumb-btn--down ${active ? 'thumb-btn--down-active' : ''}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Remove bad rating' : 'Rate puzzle bad'}
    >
      <span
        className="thumb-btn__icon-wrap"
        style={roughFilterId ? { filter: `url(#${roughFilterId})` } : undefined}
      >
        <HiOutlineHandThumbDown className="thumb-btn__glyph" size={28} strokeWidth={2.25} />
      </span>
    </button>
  );
}

export default function PostTacticDisplay({
  visible,
  solved,
  likeChoice,
  onLike,
  onDislike,
  onOpenInAnalysis,
  onOpenGame,
  lichessGameUrl,
  canOpenInAnalysis = false,
  onNextPuzzle,
  disabled = false,
  showFeedbackButtons = true,
}) {
  const roughFilterId = useId().replace(/:/g, '');

  if (!visible) return null;

  return (
    <div className="post-tactic">
      <svg width="0" height="0" className="thumb-filter-svg" aria-hidden>
        <defs>
          <filter id={roughFilterId} x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" result="noise" seed="3" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.35" />
          </filter>
        </defs>
      </svg>
      <div className="post-tactic__title">{solved ? 'Solved' : 'Failed'}</div>
      {canOpenInAnalysis || lichessGameUrl ? (
        <div className="post-tactic__open-actions">
          {canOpenInAnalysis ? (
            <OpenInAnalysisBtn
              onClick={onOpenInAnalysis}
              disabled={disabled || !onOpenInAnalysis}
            />
          ) : null}
          {lichessGameUrl ? (
            <OpenLichessGameBtn
              onClick={onOpenGame}
              disabled={disabled || !onOpenGame}
            />
          ) : null}
        </div>
      ) : null}
      {showFeedbackButtons ? (
        <div className="post-tactic__thumbs">
          <ThumbsUpBtn
            onClick={onLike}
            active={likeChoice === true}
            disabled={disabled}
            roughFilterId={roughFilterId}
          />
          <ThumbsDownBtn
            onClick={onDislike}
            active={likeChoice === false}
            disabled={disabled}
            roughFilterId={roughFilterId}
          />
        </div>
      ) : null}
      <div className="post-tactic__lichess-note">
        <NextPuzzleBtn onClick={onNextPuzzle} disabled={disabled} />
      </div>
    </div>
  );
}
