import { useEffect, useState } from 'react';

export default function PositionDisplay({ value, editable, onChange, disabled }) {
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 10,
      }}
    >
      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13 }}>Chess960 #</span>
      {editable ? (
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
          style={{
            width: 56,
            padding: '6px 8px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#111827',
            color: '#f1f5f9',
            fontWeight: 800,
          }}
        />
      ) : (
        <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>{value}</span>
      )}
    </div>
  );
}
