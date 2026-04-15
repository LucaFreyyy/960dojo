import { useEffect, useState } from 'react';

export default function PositionDisplay({ value, editable, onChange, disabled, compact = false }) {
  const [text, setText] = useState(String(value ?? 0));

  useEffect(() => {
    setText(String(value ?? 0));
  }, [value]);

  function commit(raw) {
    const n = parseInt(String(raw).replace(/\D/g, ''), 10);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(0, Math.min(959, n));
    setText(String(clamped));
    if (onChange) onChange(clamped);
  }

  const control = editable ? (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      disabled={disabled}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => commit(text)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit(text);
      }}
      className="position-display__input-inline"
      aria-label="Position number"
    />
  ) : (
    <span className="position-display__value-static">{value}</span>
  );

  if (compact) return control;

  return (
    <div className="position-display__wrap">
      <span className="position-display__label">Position</span>
      {control}
    </div>
  );
}
