import { useEffect } from 'react';

export default function ModeSelector({
  mode,
  onModeChange,
  colorChoice,
  onColorChange,
  rankedLocked,
  rankedForcedRandomHint,
}) {
  useEffect(() => {
    if (rankedLocked && mode === 'ranked') {
      onModeChange('training');
    }
  }, [rankedLocked, mode, onModeChange]);

  const btn = (active, onClick, label, lock) => (
    <button
      type="button"
      disabled={!!lock}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 10,
        border: `1px solid ${active ? '#f6d94d' : '#334155'}`,
        background: active ? '#2a2618' : '#151821',
        color: lock ? '#64748b' : active ? '#f6d94d' : '#cbd5e1',
        fontWeight: 700,
        cursor: lock ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13 }}>Mode</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {btn(mode === 'ranked', () => onModeChange('ranked'), 'Ranked', rankedLocked)}
        {btn(mode === 'training', () => onModeChange('training'), 'Training', false)}
      </div>
      {rankedLocked ? (
        <div style={{ color: '#64748b', fontSize: 12 }}>Log in to play ranked openings.</div>
      ) : null}
      {mode === 'ranked' && rankedForcedRandomHint ? (
        <div style={{ color: '#94a3b8', fontSize: 12 }}>{rankedForcedRandomHint}</div>
      ) : null}

      {mode === 'training' ? (
        <>
          <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginTop: 4 }}>Your color</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {btn(colorChoice === 'white', () => onColorChange('white'), 'White', false)}
            {btn(colorChoice === 'black', () => onColorChange('black'), 'Black', false)}
            {btn(colorChoice === 'random', () => onColorChange('random'), 'Random', false)}
          </div>
        </>
      ) : (
        <div style={{ color: '#64748b', fontSize: 12 }}>Color is random in ranked mode.</div>
      )}
    </div>
  );
}
