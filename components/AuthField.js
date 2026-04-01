export default function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  onKeyDown,
  inputRef,
  autoComplete,
  disabled = false,
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>{label}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        disabled={disabled}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '9px 11px',
          borderRadius: 10,
          border: '1px solid #334155',
          background: '#0f172a',
          color: '#e2e8f0',
          fontSize: 14,
          outline: 'none',
        }}
      />
    </label>
  );
}

