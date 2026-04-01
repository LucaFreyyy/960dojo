import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import { supabase } from '../lib/supabase';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import Link from 'next/link';

export default function NotificationsPage() {
  const session = useSupabaseSession();
  const [userId, setUserId] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!session?.user?.email) return setUserId(null);
    hashEmail(session.user.email).then(setUserId).catch(() => setUserId(null));
  }, [session]);

  async function loadRequests(uid = userId) {
    if (!uid) return;
    const { data, error } = await supabase
      .from('FriendRequest')
      .select('id, requesterId, createdAt')
      .eq('receiverId', uid)
      .eq('status', 'pending')
      .order('createdAt', { ascending: false });
    if (error || !data) return setRequests([]);
    const ids = data.map((r) => r.requesterId);
    const { data: users } = await supabase.from('User').select('id, name').in('id', ids);
    const byId = new Map((users || []).map((u) => [u.id, u.name]));
    setRequests(
      data.map((r) => ({
        ...r,
        requesterName: byId.get(r.requesterId) || 'Unknown player',
      }))
    );
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function acceptRequest(id) {
    if (!userId) return;
    await supabase
      .from('FriendRequest')
      .update({ status: 'accepted' })
      .eq('id', id)
      .eq('receiverId', userId);
    loadRequests();
  }

  async function declineRequest(id) {
    if (!userId) return;
    await supabase.from('FriendRequest').delete().eq('id', id).eq('receiverId', userId);
    loadRequests();
  }

  return (
    <>
      <Head>
        <title>Notifications - 960 Dojo</title>
      </Head>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <SectionTitle title="Notifications" />
        {!userId ? (
          <div style={{ color: '#e2e8f0' }}>Please log in to view notifications.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>No pending friend requests.</div>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: '1px solid #334155',
                    borderRadius: 12,
                    background: '#111827',
                    padding: '0.85rem 0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ color: '#e2e8f0' }}>
                    <Link href={`/profile/${r.requesterId}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 700 }}>
                      {r.requesterName}
                    </Link>{' '}
                    sent you a friend request.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      onClick={() => acceptRequest(r.id)}
                      style={{ background: '#16a34a', border: '1px solid #15803d', color: '#fff', fontWeight: 800 }}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => declineRequest(r.id)}
                      style={{ background: '#b91c1c', border: '1px solid #991b1b', color: '#fff', fontWeight: 800 }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}

