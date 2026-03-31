export default function RatingDisplay({ label, rating, delta = null, provisional = false }) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const deltaText = hasDelta ? `${delta >= 0 ? '+' : ''}${delta}` : null;
  const deltaColor = !hasDelta ? '#94a3b8' : delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : '#cbd5e1';

  return (
    <div
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '0.6rem 0.9rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ color: '#94a3b8', fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 800 }}>
        {Number.isFinite(rating) ? `${rating}${provisional ? '?' : ''}` : '—'}
        {hasDelta ? <span style={{ color: deltaColor, marginLeft: 8 }}>({deltaText})</span> : null}
      </span>
    </div>
  );
}

