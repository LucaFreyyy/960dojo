import Link from 'next/link';

export default function FriendsList({ friends = [], title = 'Friends' }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        background: '#111827',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '0.85rem 0.95rem',
      }}
    >
      <div style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: 8 }}>
        {title} ({friends.length})
      </div>
      {friends.length ? (
        <ul style={{ margin: 0, paddingLeft: 16, color: '#cbd5e1' }}>
          {friends.map((f) => (
            <li key={f.id} style={{ marginBottom: 4 }}>
              <Link href={`/profile/${f.id}`} style={{ color: '#93c5fd', textDecoration: 'none' }}>
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>No friends yet.</div>
      )}
    </div>
  );
}

