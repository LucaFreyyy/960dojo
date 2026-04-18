import StreakFlameBadge from './StreakFlameBadge';
import { activeStreakFlameVariant } from '../../lib/streakCompute';

/**
 * @param {{ streak: { currentStreak: number, longestStreak: number, playedToday?: boolean } | null }} props
 */
export default function ProfileStreakRow({ streak }) {
  if (!streak) return null;

  const activeVar = activeStreakFlameVariant(streak);

  const showActive = streak.currentStreak > 0;
  const showRecord = streak.longestStreak > 0 && streak.longestStreak > streak.currentStreak;

  if (!showActive && !showRecord) return null;

  return (
    <div className="profile-streak-row" aria-label="Daily play streak">
      {showActive ? (
        <StreakFlameBadge
          variant={activeVar === 'half' ? 'half' : 'full'}
          value={streak.currentStreak}
          tooltip="Active streak"
        />
      ) : null}
      {showRecord ? (
        <StreakFlameBadge variant="muted" value={streak.longestStreak} tooltip="Longest streak" />
      ) : null}
    </div>
  );
}
