import Link from 'next/link';
import RatingEstablishedHint from './RatingEstablishedHint';

export default function RatingDisplay({
  label,
  rating,
  delta = null,
  secondaryRating = null,
  provisional = false,
  className = '',
  profileUserId = null,
  /** Optional node rendered in the horizontal center (e.g. tactics FEN castling strip). */
  centerContent = null,
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const hasSecondary = Number.isFinite(secondaryRating);
  const deltaText = hasDelta ? `${delta >= 0 ? '+' : ''}${delta}` : null;
  let deltaMod = '';
  if (hasDelta) {
    if (delta > 0) deltaMod = 'rating-display__delta--up';
    else if (delta < 0) deltaMod = 'rating-display__delta--down';
  }

  const hasCenter = centerContent != null && centerContent !== false;

  return (
    <div className={`rating-display ${hasCenter ? 'rating-display--with-center' : ''} ${className}`.trim()}>
      {profileUserId ? (
        <Link href={`/profile/${profileUserId}`} className="rating-display__label rating-display__label-link">
          {label}
        </Link>
      ) : (
        <span className="rating-display__label">{label}</span>
      )}
      {hasCenter ? <div className="rating-display__center">{centerContent}</div> : null}
      <span className="rating-display__value">
        <span className="rating-display__value-inner">
          {Number.isFinite(rating) ? String(rating) : '—'}
          {provisional ? <RatingEstablishedHint /> : null}
        </span>
        {hasSecondary ? <span className="rating-display__secondary">({secondaryRating})</span> : null}
        {hasDelta ? (
          <span className={`rating-display__delta ${deltaMod}`.trim()}>({deltaText})</span>
        ) : null}
      </span>
    </div>
  );
}
