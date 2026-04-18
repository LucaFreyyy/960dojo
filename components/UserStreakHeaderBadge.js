import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import StreakFlameBadge from './streak/StreakFlameBadge';
import { activeStreakFlameVariant, normalizePersistedStreakRow } from '../lib/streakCompute';

export default function UserStreakHeaderBadge() {
  const session = useSupabaseSession();
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (!session?.user?.email) {
      setStreak(null);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const uid = await hashEmail(session.user.email);
        const { data, error } = await supabase
          .from('Streak')
          .select('currentStreak, longestStreak, lastActivityDate')
          .eq('userId', uid)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setStreak(null);
          return;
        }
        if (!data) {
          setStreak(null);
          return;
        }
        setStreak(normalizePersistedStreakRow(data));
      } catch {
        if (!cancelled) setStreak(null);
      }
    }

    load();

    function onStreakChanged() {
      load();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('dojo-streak-changed', onStreakChanged);
    }
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('dojo-streak-changed', onStreakChanged);
      }
    };
  }, [session]);

  if (!session || !streak || streak.currentStreak < 1) return null;

  const variant = activeStreakFlameVariant(streak);

  return (
    <div className="header-streak-badge" aria-label="Your daily play streak">
      <StreakFlameBadge
        variant={variant === 'none' ? 'full' : variant}
        value={streak.currentStreak}
        tooltip="Active streak"
      />
    </div>
  );
}
