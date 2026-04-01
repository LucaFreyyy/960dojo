import Link from 'next/link';

export default function FriendsList({ friends = [], title = 'Friends' }) {
  return (
    <div className="friends-panel">
      <div className="friends-panel__title">
        {title} ({friends.length})
      </div>
      {friends.length ? (
        <ul className="friends-panel__list">
          {friends.map((f) => (
            <li key={f.id}>
              <Link href={`/profile/${f.id}`} className="link">
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
