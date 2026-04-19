import { useMemo } from 'react';
import { castlingRightsDisplayFromFen } from '../lib/fenCastlingRights';

function CastleChip({ label, active }) {
  return (
    <span className={`fen-castle-chip ${active ? 'fen-castle-chip--on' : 'fen-castle-chip--off'}`}>{label}</span>
  );
}

/**
 * Shows 0-0 / 0-0-0 for each side; “on” styling matches the FEN castling field (via chessops).
 */
export default function FenCastlingRightsStrip({ fen, className = '' }) {
  const r = useMemo(() => castlingRightsDisplayFromFen(fen), [fen]);

  return (
    <div className={`fen-castle-strip ${className}`.trim()} aria-label="Castling rights from position FEN">
      <span className="fen-castle-strip__side">
        <span className="fen-castle-strip__color" aria-hidden>
          ♚
        </span>
        <CastleChip label="0-0" active={r.white.short} />
        <CastleChip label="0-0-0" active={r.white.long} />
      </span>
      <span className="fen-castle-strip__sep" aria-hidden>
        ·
      </span>
      <span className="fen-castle-strip__side">
        <span className="fen-castle-strip__color" aria-hidden>
          ♔
        </span>
        <CastleChip label="0-0" active={r.black.short} />
        <CastleChip label="0-0-0" active={r.black.long} />
      </span>
    </div>
  );
}
