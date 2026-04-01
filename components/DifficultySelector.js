const options = ['easy', 'middle', 'hard'];

export default function DifficultySelector({ value, onChange, disabled = false }) {
  return (
    <div className="difficulty-row">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange?.(opt)}
          disabled={disabled}
          className={`diff-opt ${value === opt ? 'diff-opt--active' : ''}`.trim()}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
