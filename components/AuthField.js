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
    <label className="auth-field">
      <span className="auth-field__label">{label}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        disabled={disabled}
        className="auth-field__input"
      />
    </label>
  );
}
