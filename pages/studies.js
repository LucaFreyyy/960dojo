import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { useSupabaseSession } from '../lib/SessionContext';
import { supabase } from '../lib/supabase';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

export default function StudiesPage() {
  const session = useSupabaseSession();
  const [q, setQ] = useState('');
  const [username, setUsername] = useState('');
  const [sort, setSort] = useState('updatedAt');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeader = useMemo(() => {
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (username.trim()) params.set('username', username.trim());
        params.set('sort', sort === 'createdAt' ? 'createdAt' : 'updatedAt');
        params.set('order', 'desc');
        params.set('take', '50');
        const res = await fetch(`/api/studies?${params.toString()}`, { headers: { ...authHeader } });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || 'Failed to load studies');
        if (!cancelled) setItems(Array.isArray(payload.items) ? payload.items : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load studies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, username, sort, authHeader]);

  return (
    <>
      <Head>
        <title>Studies - 960 Dojo</title>
      </Head>
      <main className="page-shell openings-page">
        <SectionTitle title="Studies" />

        <div className="studies-controls">
          <input
            className="studies-input"
            placeholder="Search title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            className="studies-input"
            placeholder="Filter by username (optional)…"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select className="studies-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="updatedAt">Recently updated</option>
            <option value="createdAt">Newest created</option>
          </select>
          {session?.user?.email ? (
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={async () => {
                const { data } = await supabase.auth.getUser();
                const email = data?.user?.email;
                if (!email) return;
                const { data: row } = await supabase.from('User').select('name').ilike('email', email).maybeSingle();
                if (row?.name) setUsername(row.name);
              }}
            >
              My studies
            </button>
          ) : null}
          {username ? (
            <button type="button" className="btn btn--sm btn--secondary" onClick={() => setUsername('')}>
              Clear user
            </button>
          ) : null}
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {loading ? <p className="muted">Loading…</p> : null}

        <div className="studies-list">
          {items.map((s) => (
            <Link key={s.id} className="studies-card" href={`/analysis?study=${encodeURIComponent(s.id)}`}>
              <div className="studies-card__top">
                <div className="studies-card__title">{s.title?.trim() ? s.title.trim() : 'Untitled study'}</div>
                <span className={`studies-card__badge ${s.isPublic ? 'studies-card__badge--public' : 'studies-card__badge--private'}`}>
                  {s.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="studies-card__meta">
                <span>By {s.ownerName || s.ownerId}</span>
                <span>Updated {formatWhen(s.updatedAt)}</span>
              </div>
            </Link>
          ))}
          {!loading && items.length === 0 ? <p className="muted">No studies found.</p> : null}
        </div>
      </main>
    </>
  );
}

