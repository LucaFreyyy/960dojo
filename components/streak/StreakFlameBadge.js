import StreakFlameIcon from './StreakFlameIcon';

/**
 * @param {{ variant: 'full' | 'half' | 'muted', value: number, tooltip: string }} props
 */
export default function StreakFlameBadge({ variant, value, tooltip }) {
  if (!value || value < 1) return null;
  if (variant === 'none') return null;

  return (
    <span className="streak-flame-badge" data-streak-tooltip={tooltip}>
      <StreakFlameIcon variant={variant} />
      <span className="streak-flame-badge__value" aria-hidden>
        {value}
      </span>
      <span className="streak-flame-badge__sr">{tooltip}</span>
    </span>
  );
}
