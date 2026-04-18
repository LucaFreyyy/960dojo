import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FriendsList({ friends = [], title = 'Friends' }) {
  const router = useRouter();
  const qTabRaw = router.query?.tab;
  const qTab = Array.isArray(qTabRaw) ? qTabRaw[0] : qTabRaw;
  const tabQuery = typeof qTab === 'string' && qTab ? `?tab=${encodeURIComponent(qTab)}` : '';

  return (
    <div className="friends-panel">
      <div className="friends-panel__title">
        {title} ({friends.length})
      </div>
      {friends.length ? (
        <ul className="friends-panel__list">
          {friends.map((f) => (
            <li key={f.id}>
              <Link href={`/profile/${f.id}${tabQuery}`} className="link">
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="friends-panel__empty">No friends yet.</div>
      )}
    </div>
  );
}
