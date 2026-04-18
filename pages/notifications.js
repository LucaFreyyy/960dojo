import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import { supabase } from '../lib/supabase';
import { FEEDBACK_ADMIN_USERNAME } from '../lib/feedbackAdminConstants';
import { authedJsonFetch } from '../lib/playClient';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import Link from 'next/link';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function NotificationsPage() {
  const session = useSupabaseSession();
  const [userId, setUserId] = useState(null);
  const [isFeedbackAdmin, setIsFeedbackAdmin] = useState(false);
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [playNotifications, setPlayNotifications] = useState([]);

  useEffect(() => {
    if (!session?.user?.email) return setUserId(null);
    hashEmail(session.user.email).then(setUserId).catch(() => setUserId(null));
  }, [session]);

  const loadRequests = useCallback(async (uid = userId) => {
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
  }, [userId]);

  const loadFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setFeedback([]);
        return;
      }
      const res = await fetch('/api/feedback/inbox', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setFeedback([]);
        return;
      }
      const json = await res.json();
      const rows = json.feedback || [];
      const submitterIds = [...new Set(rows.map((f) => f.userId).filter(Boolean))];
      let byId = new Map();
      if (submitterIds.length) {
        const { data: users } = await supabase.from('User').select('id, name').in('id', submitterIds);
        byId = new Map((users || []).map((u) => [u.id, u.name]));
      }
      setFeedback(
        rows.map((f) => ({
          ...f,
          submitterName: f.userId ? byId.get(f.userId) || 'Player' : null,
        }))
      );
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  const loadPlayNotifications = useCallback(async () => {
    try {
      const { data: rows, error } = await supabase
        .from('PlayNotification')
        .select('id, userId, senderId, gameId, kind, status, payload, createdAt, read')
        .eq('userId', userId)
        .eq('status', 'pending')
        .order('createdAt', { ascending: false });
      if (error) {
        setPlayNotifications([]);
        return;
      }
      const ids = [...new Set(rows.flatMap((row) => [row.userId, row.senderId]).filter(Boolean))];
      let byId = new Map();
      if (ids.length) {
        const { data: users } = await supabase.from('User').select('id, name').in('id', ids);
        byId = new Map((users || []).map((u) => [u.id, u.name]));
      }
      setPlayNotifications(
        rows.map((row) => ({
          ...row,
          senderName: byId.get(row.senderId) || 'Player',
        }))
      );
    } catch {
      setPlayNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsFeedbackAdmin(false);
      setFeedback([]);
      setPlayNotifications([]);
      return;
    }
    loadRequests();
    loadPlayNotifications();
    (async () => {
      const { data } = await supabase.from('User').select('name').eq('id', userId).maybeSingle();
      const admin = data?.name === FEEDBACK_ADMIN_USERNAME;
      setIsFeedbackAdmin(admin);
      if (admin) await loadFeedback();
      else setFeedback([]);
    })();
  }, [userId, loadRequests, loadFeedback, loadPlayNotifications]);

  async function acceptRequest(id) {
    if (!userId) return;
    await supabase
      .from('FriendRequest')
      .update({ status: 'accepted' })
      .eq('id', id)
      .eq('receiverId', userId);
    await loadRequests();
  }

  async function declineRequest(id) {
    if (!userId) return;
    await supabase.from('FriendRequest').delete().eq('id', id).eq('receiverId', userId);
    await loadRequests();
  }

  async function markFeedbackRead(id, read) {
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch(`/api/feedback/inbox/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      await loadFeedback();
    }
  }

  async function deleteFeedback(id) {
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch(`/api/feedback/inbox/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await loadFeedback();
    }
  }

  async function respondToRematch(notificationId, accept) {
    try {
      const result = await authedJsonFetch('/api/play/action', {
        method: 'POST',
        body: JSON.stringify({
          action: accept ? 'accept_rematch' : 'decline_rematch',
          notificationId,
        }),
      });
      await loadPlayNotifications();
      if (accept && result?.game?.id) {
        window.location.href = `/play?game=${encodeURIComponent(result.game.id)}`;
      }
    } catch {}
  }

  const hasFriendNotifications = requests.length > 0;

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
            {hasFriendNotifications ? (
              <section className="notifications-section">
                <h3 className="notifications-section__title">Friend requests</h3>
                {requests.map((r) => (
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
                ))}
              </section>
            ) : null}

            {playNotifications.length > 0 ? (
              <section className="notifications-section">
                <h3 className="notifications-section__title">Play</h3>
                {playNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={[
                      'notification-card',
                      n.read === false ? 'notification-card--unread' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="notification-card__text">
                      <strong>{n.senderName}</strong> offered you a rematch.
                    </div>
                    <div className="notification-card__actions">
                      <Button onClick={() => respondToRematch(n.id, true)} variant="success">
                        Accept
                      </Button>
                      <Button onClick={() => respondToRematch(n.id, false)} variant="danger">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {isFeedbackAdmin ? (
              <section className="notifications-section">
                <h3 className="notifications-section__title">Feedback</h3>
                {feedbackLoading ? (
                  <div className="text-muted">Loading feedback…</div>
                ) : feedback.length === 0 ? (
                  <div className="text-muted">No feedback submissions yet.</div>
                ) : (
                  feedback.map((f) => {
                    const unread = f.read !== true;
                    return (
                    <div
                      key={f.id}
                      className={[
                        'notification-card',
                        'notification-card--feedback',
                        unread ? 'notification-card--unread' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="notification-card__text notification-card__text--block">
                        <div className="feedback-notification__meta">
                          <span className="feedback-notification__type">{f.type || 'general'}</span>
                          {f.createdAt ? (
                            <span className="feedback-notification__date">
                              {new Date(f.createdAt).toLocaleString()}
                            </span>
                          ) : null}
                          {unread ? (
                            <span className="feedback-notification__unread-badge">Unread</span>
                          ) : null}
                        </div>
                        <p className="feedback-notification__message">{f.message}</p>
                        <div className="feedback-notification__from">
                          {f.userId ? (
                            <>
                              From{' '}
                              <Link href={`/profile/${f.userId}`} className="notification-card__link">
                                {f.submitterName || 'Player'}
                              </Link>
                            </>
                          ) : f.email ? (
                            <>Guest ({f.email})</>
                          ) : (
                            <>Anonymous</>
                          )}
                        </div>
                      </div>
                      <div className="notification-card__actions">
                        {unread ? (
                          <Button
                            className="btn--sm"
                            variant="primary"
                            onClick={() => markFeedbackRead(f.id, true)}
                          >
                            Mark read
                          </Button>
                        ) : (
                          <Button
                            className="btn--sm"
                            variant="primary"
                            onClick={() => markFeedbackRead(f.id, false)}
                          >
                            Mark unread
                          </Button>
                        )}
                        <Button className="btn--sm" variant="danger" onClick={() => deleteFeedback(f.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    );
                  })
                )}
              </section>
            ) : null}

            {userId && !isFeedbackAdmin && !hasFriendNotifications && playNotifications.length === 0 ? (
              <div className="text-muted">No notifications.</div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
