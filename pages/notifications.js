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
      <main className="page-shell page-shell--notifications">
        <SectionTitle title="Notifications" />
        {!userId ? (
          <div className="text-muted">Please log in to view notifications.</div>
        ) : (
          <div className="notifications-stack">
            {requests.length === 0 ? (
              <div className="text-muted">No notifications.</div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="notification-card">
                  <div className="notification-card__text">
                    <Link href={`/profile/${r.requesterId}`} className="notification-card__link">
                      {r.requesterName}
                    </Link>{' '}
                    sent you a friend request.
                  </div>
                  <div className="notification-card__actions">
                    <Button onClick={() => acceptRequest(r.id)} variant="success">
                      Accept
                    </Button>
                    <Button onClick={() => declineRequest(r.id)} variant="danger">
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
