import Button from './Button';

export default function BackrankInput({
  value,
  onChange,
  onApply,
  disabled = false,
  example = 'bbnnrkqr',
}) {
  return (
    <div className="backrank-input__wrap">
      <label className="backrank-input__label" htmlFor="analysis-backrank">
        Back rank
      </label>
      <div className="backrank-input__row">
        <input
          id="analysis-backrank"
          className="backrank-input__field"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value.toLowerCase())}
          onBlur={onApply}
          placeholder={example}
          maxLength={8}
          spellCheck={false}
        />
        <Button className="btn--sm" variant="secondary" onClick={onApply} disabled={disabled}>
          Apply
        </Button>
      </div>
      <div className="backrank-input__hint">Example: <code>{example}</code></div>
    </div>
  );
}
