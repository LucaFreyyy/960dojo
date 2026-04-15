import Image from 'next/image';
import { STREAK_SYMBOL_NATIVE_H, STREAK_SYMBOL_NATIVE_W, streakSymbolSrc } from '../../lib/streakCompute';

/**
 * Piece + flame glyph: `full` (active + played today), `half` (active, not yet today), `muted` (record only).
 * Tier (pawn → king) is chosen from `streakValue`; variant picks the sprite column (0–2).
 */
export default function StreakFlameIcon({ variant = 'full', className = '', title, streakValue }) {
  const baseClass = `streak-flame-svg streak-flame-svg--${variant} ${className}`.trim();
  const src = streakSymbolSrc(streakValue, variant);
  if (!src) return null;

  return (
    <Image
      className={baseClass}
      src={src}
      alt={title || 'Streak symbol'}
      width={STREAK_SYMBOL_NATIVE_W}
      height={STREAK_SYMBOL_NATIVE_H}
      aria-hidden={title ? undefined : true}
    />
  );
}
