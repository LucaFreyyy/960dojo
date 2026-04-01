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

function isAdjacentFile(a, b) {
  const ia = CHESS960_FILES.indexOf(a);
  const ib = CHESS960_FILES.indexOf(b);
  return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
}

function sameSquareColorOnBackRank(a, b) {
  const ia = CHESS960_FILES.indexOf(a);
  const ib = CHESS960_FILES.indexOf(b);
  if (ia < 0 || ib < 0) return false;
  return (ia % 2) === (ib % 2);
}

function normalizeFixedFilesForPiece(piece, fileSet) {
  const ordered = CHESS960_FILES.filter((f) => fileSet.has(f));
  const out = [];
  for (const f of ordered) {
    if (piece === 'king' && (f === 'a' || f === 'h')) continue;
    if (out.length >= 2) continue;
    if (piece === 'king' && out.length >= 1) continue;
    if (piece === 'rook' && out.some((x) => isAdjacentFile(x, f))) continue;
    if (piece === 'bishop' && out.some((x) => sameSquareColorOnBackRank(x, f))) continue;
    out.push(f);
  }
  return new Set(out);
}

const PositionSelector = forwardRef(function PositionSelector(
  { rankedMode, openingNr, onOpeningNrChange, onTrainingOnlyNotice, disabled, minimal },
  ref
) {
  const [positionMode, setPositionMode] = useState('random');
  const [fixedPiece, setFixedPiece] = useState('knight');
  const [fixedFiles, setFixedFiles] = useState(() => new Set(['e']));

  useEffect(() => {
    setFixedFiles((prev) => normalizeFixedFilesForPiece(fixedPiece, prev));
  }, [fixedPiece]);

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
        if (n.has(f)) return new Set([...n].filter((x) => x !== f));

        if (n.size >= 2) return n;
        if (fixedPiece === 'king') {
          if (f === 'a' || f === 'h') return n;
          if (n.size >= 1) return n;
        }
        if (fixedPiece === 'rook' && [...n].some((x) => isAdjacentFile(x, f))) return n;
        if (fixedPiece === 'bishop' && [...n].some((x) => sameSquareColorOnBackRank(x, f))) return n;
        n.add(f);
        return n;
      });
    },
    [rankedMode, onTrainingOnlyNotice, fixedPiece]
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

  useEffect(() => {
    if (minimal) return;
    if (positionMode === 'number' && !rankedMode) return;
    generatePosition();
  }, [minimal, rankedMode, positionMode, fixedPiece, fixedFiles, generatePosition]);

  if (minimal) return null;

  return (
    <div className="position-selector">
      <div className="panel-label">Starting position</div>
      <div className="chip-row">
        {POSITION_MODES.filter(({ key }) => !rankedMode || key === 'random').map(({ key, label }) => {
          const active = positionMode === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => trySetMode(key)}
              className={`pos-mode-btn ${active ? 'pos-mode-btn--active' : ''}`.trim()}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showFixed ? (
        <div className="stack stack--gap-md">
          <div className="chip-row chip-row--center">
            <span className="hint">Piece</span>
            <select
              value={fixedPiece}
              disabled={disabled}
              onChange={(e) => setFixedPiece(e.target.value)}
              className="file-select"
            >
              {PIECE_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hint">Files (all must match)</div>
          <div className="chip-row">
            {CHESS960_FILES.map((f) => {
              const on = fixedFiles.has(f);
              const size = fixedFiles.size;
              const blockedByCap = !on && size >= 2;
              const blockedByKingFile = fixedPiece === 'king' && (f === 'a' || f === 'h');
              const blockedByKingCount = fixedPiece === 'king' && !on && size >= 1;
              const blockedByRookAdj =
                fixedPiece === 'rook' && !on && [...fixedFiles].some((x) => isAdjacentFile(x, f));
              const blockedByBishopColor =
                fixedPiece === 'bishop' && !on && [...fixedFiles].some((x) => sameSquareColorOnBackRank(x, f));
              const blocked =
                blockedByCap ||
                blockedByKingFile ||
                blockedByKingCount ||
                blockedByRookAdj ||
                blockedByBishopColor;
              return (
                <button
                  key={f}
                  type="button"
                  disabled={disabled || blocked}
                  onClick={() => toggleFile(f)}
                  className={`file-letter-btn ${on ? 'file-letter-btn--on' : ''} ${blocked ? 'file-letter-btn--blocked' : ''}`.trim()}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {numberEditable ? (
        <PositionDisplay
          value={openingNr}
          editable={numberEditable && !disabled}
          onChange={onOpeningNrChange}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
});

export default PositionSelector;
