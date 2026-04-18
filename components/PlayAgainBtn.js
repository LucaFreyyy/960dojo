export default function PlayAgainBtn({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="play-again-btn"
    >
      Play again
    </button>
  );
}
