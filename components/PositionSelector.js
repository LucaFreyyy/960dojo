import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import PositionDisplay from './PositionDisplay';
import { CHESS960_FILES, filterPositionNrsByPieceFiles, pickRandom, randomInt } from '../lib/chess960';

const PIECE_OPTIONS = [
  { key: 'knight', label: 'Knight' },
  { key: 'bishop', label: 'Bishop' },
  { key: 'rook', label: 'Rook' },
  { key: 'queen', label: 'Queen' },
  { key: 'king', label: 'King' },
];

const POSITION_MODES = [
  { key: 'random', label: 'Random' },
  { key: 'number', label: 'Number' },
  { key: 'fixed', label: 'Fixed piece' },
];

const PositionSelector = forwardRef(function PositionSelector(
  { rankedMode, openingNr, onOpeningNrChange, onTrainingOnlyNotice, disabled, minimal },
  ref
) {
  const [positionMode, setPositionMode] = useState('random');
  const [fixedPiece, setFixedPiece] = useState('knight');
  const [fixedFiles, setFixedFiles] = useState(() => new Set(['e']));

  useEffect(() => {
    if (rankedMode && positionMode !== 'random') {
      setPositionMode('random');
    }
  }, [rankedMode, positionMode]);

  const trySetMode = useCallback(
    (next) => {
      if (rankedMode && next !== 'random') {
        if (onTrainingOnlyNotice) onTrainingOnlyNotice();
        return;
      }
      setPositionMode(next);
    },
    [rankedMode, onTrainingOnlyNotice]
  );

  const toggleFile = useCallback(
    (f) => {
      if (rankedMode) {
        if (onTrainingOnlyNotice) onTrainingOnlyNotice();
        return;
      }
      setFixedFiles((prev) => {
        const n = new Set(prev);
        if (n.has(f)) n.delete(f);
        else n.add(f);
        return n;
      });
    },
    [rankedMode, onTrainingOnlyNotice]
  );

  const generatePosition = useCallback(() => {
    if (rankedMode || positionMode === 'random') {
      const n = randomInt(960);
      onOpeningNrChange(n);
      return { openingNr: n };
    }
    if (positionMode === 'number') {
      return { openingNr: openingNr };
    }
    const files = CHESS960_FILES.filter((f) => fixedFiles.has(f));
    const pool = filterPositionNrsByPieceFiles(fixedPiece, files);
    const pick = pool.length ? pickRandom(pool) : randomInt(960);
    const n = pick === null ? randomInt(960) : pick;
    onOpeningNrChange(n);
    return { openingNr: n };
  }, [rankedMode, positionMode, openingNr, fixedPiece, fixedFiles, onOpeningNrChange]);

  useImperativeHandle(ref, () => ({ generatePosition }), [generatePosition]);

  const numberEditable = !rankedMode && positionMode === 'number';
  const showFixed = !rankedMode && positionMode === 'fixed';

  if (minimal) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13 }}>Starting position</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {POSITION_MODES.map(({ key, label }) => {
          const active = positionMode === key;
          const lockRanked = rankedMode && key !== 'random';
          return (
            <button
              key={key}
              type="button"
              disabled={disabled || lockRanked}
              onClick={() => trySetMode(key)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: `1px solid ${active ? '#38bdf8' : '#334155'}`,
                background: active ? '#0c1a22' : '#151821',
                color: lockRanked ? '#475569' : active ? '#7dd3fc' : '#cbd5e1',
                fontWeight: 700,
                cursor: disabled || lockRanked ? 'not-allowed' : 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showFixed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Piece</span>
            <select
              value={fixedPiece}
              disabled={disabled}
              onChange={(e) => setFixedPiece(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155',
              }}
            >
              {PIECE_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Files (all must match)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CHESS960_FILES.map((f) => {
              const on = fixedFiles.has(f);
              return (
                <button
                  key={f}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleFile(f)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: `1px solid ${on ? '#f6d94d' : '#334155'}`,
                    background: on ? '#2a2618' : '#0f131a',
                    color: on ? '#f6d94d' : '#94a3b8',
                    fontWeight: 800,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <PositionDisplay
        value={openingNr}
        editable={numberEditable && !disabled}
        onChange={onOpeningNrChange}
        disabled={disabled}
      />
    </div>
  );
});

export default PositionSelector;
