import { RATING_ESTABLISHED_HINT_TEXT } from '../lib/ratingConstants';

export default function RatingEstablishedHint({ className = '' }) {
  return (
    <span
      className={`rating-established-hint ${className}`.trim()}
      title={RATING_ESTABLISHED_HINT_TEXT}
      aria-label={RATING_ESTABLISHED_HINT_TEXT}
    >
      ?
    </span>
  );
}
