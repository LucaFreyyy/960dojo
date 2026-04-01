export default function StartBtn({ onClick, disabled, label = 'Start' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: 8,
        padding: '12px 22px',
        borderRadius: 12,
        border: '1px solid #f6d94d',
        background: disabled ? '#1e293b' : '#f6d94d',
        color: disabled ? '#64748b' : '#0f172a',
        fontWeight: 800,
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: 160,
      }}
    >
      {label}
    </button>
  );
}
