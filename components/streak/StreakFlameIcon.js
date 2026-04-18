import Image from 'next/image';

/**
 * Flame glyph: `full` (active + played today), `half` (active, not yet today), `muted` (record only).
 */
export default function StreakFlameIcon({ variant = 'full', className = '', title }) {
  const baseClass = `streak-flame-svg streak-flame-svg--${variant} ${className}`.trim();
  const src =
    variant === 'half'
      ? '/streak-symbols/half_flame_pawn.png'
      : variant === 'muted'
        ? '/streak-symbols/burned_out_pawn.png'
        : '/streak-symbols/full_flame_pawn.png';

  return (
    <Image
      className={baseClass}
      src={src}
      alt={title || 'Streak symbol'}
      width={28}
      height={35}
      aria-hidden={title ? undefined : true}
    />
  );
}
