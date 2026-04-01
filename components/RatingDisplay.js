export default function RatingDisplay({ label, rating, delta = null, provisional = false }) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const deltaText = hasDelta ? `${delta >= 0 ? '+' : ''}${delta}` : null;
  let deltaMod = '';
  if (hasDelta) {
    if (delta > 0) deltaMod = 'rating-display__delta--up';
    else if (delta < 0) deltaMod = 'rating-display__delta--down';
  }

  return (
    <div className="rating-display">
      <span className="rating-display__label">{label}</span>
      <span className="rating-display__value">
        {Number.isFinite(rating) ? `${rating}${provisional ? '?' : ''}` : '—'}
        {hasDelta ? (
          <span className={`rating-display__delta ${deltaMod}`.trim()}>({deltaText})</span>
        ) : null}
      </span>
    </div>
  );
}
