export default function StartBtn({ onClick, disabled, label = 'Start' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="start-btn"
    >
      {label}
    </button>
  );
}
