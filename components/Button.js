export default function Button({ children, onClick, disabled = false, style = {} }) {
  return (
    <button
      className="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        background: 'var(--bg-button)',
        color: 'var(--text-color-main)',
        border: 'var(--border-soft)',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
}

