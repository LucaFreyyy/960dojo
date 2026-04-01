export default function PlayAgainBtn({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 18px',
        borderRadius: 12,
        border: '1px solid #38bdf8',
        background: '#0c1a22',
        color: '#7dd3fc',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      Play again
    </button>
  );
}
