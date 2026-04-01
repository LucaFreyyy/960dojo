import { useEffect } from 'react';

export default function ModeSelector({
  mode,
  onModeChange,
  colorChoice,
  onColorChange,
  rankedLocked,
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
      className={`mode-chip ${active ? 'mode-chip--active' : ''} ${lock ? 'mode-chip--locked' : ''}`.trim()}
    >
      {label}
    </button>
  );

  return (
    <div className="mode-block">
      <div className="panel-label">Mode</div>
      <div className="chip-row">
        {btn(mode === 'ranked', () => onModeChange('ranked'), 'Ranked', rankedLocked)}
        {btn(mode === 'training', () => onModeChange('training'), 'Training', false)}
      </div>
      {rankedLocked ? (
        <div className="hint">Log in to play ranked openings.</div>
      ) : null}

      {mode === 'training' ? (
        <>
          <div className="panel-label panel-label--spaced">Your color</div>
          <div className="chip-row">
            {btn(colorChoice === 'white', () => onColorChange('white'), 'White', false)}
            {btn(colorChoice === 'black', () => onColorChange('black'), 'Black', false)}
            {btn(colorChoice === 'random', () => onColorChange('random'), 'Random', false)}
          </div>
        </>
      ) : null}
    </div>
  );
}
