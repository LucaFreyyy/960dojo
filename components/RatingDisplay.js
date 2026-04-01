import RatingEstablishedHint from './RatingEstablishedHint';

export default function RatingDisplay({ label, rating, delta = null, provisional = false, className = '' }) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const deltaText = hasDelta ? `${delta >= 0 ? '+' : ''}${delta}` : null;
  let deltaMod = '';
  if (hasDelta) {
    if (delta > 0) deltaMod = 'rating-display__delta--up';
    else if (delta < 0) deltaMod = 'rating-display__delta--down';
  }

  return (
    <div className={`rating-display ${className}`.trim()}>
      <span className="rating-display__label">{label}</span>
      <span className="rating-display__value">
        <span className="rating-display__value-inner">
          {Number.isFinite(rating) ? String(rating) : '—'}
          {provisional ? <RatingEstablishedHint /> : null}
        </span>
        {hasDelta ? (
          <span className={`rating-display__delta ${deltaMod}`.trim()}>({deltaText})</span>
        ) : null}
      </span>
    </div>
  );
}
