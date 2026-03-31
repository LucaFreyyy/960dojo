import Button from './Button';

const options = ['easy', 'middle', 'hard'];

export default function DifficultySelector({ value, onChange, disabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <Button
          key={opt}
          onClick={() => onChange?.(opt)}
          disabled={disabled}
          style={{
            padding: '0.5rem 0.9rem',
            textTransform: 'capitalize',
            background: value === opt ? '#2563eb' : '#1f2937',
            color: '#e5e7eb',
            border: '1px solid #334155',
            fontWeight: 700,
          }}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

