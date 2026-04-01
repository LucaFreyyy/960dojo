import Head from 'next/head';
import { useState } from 'react';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';

export default function FeedbackPage() {
  const session = useSupabaseSession();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (message.length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    
    if (message.length > 5000) {
      setError('Message is too long (max 5000 characters).');
      return;
    }

    if (!session && !email) {
      setError('Please provide an email address so we can respond.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let userId = null;
      if (session?.user?.email) {
        userId = await hashEmail(session.user.email);
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: session ? null : email,
          message,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setMessage('');
      setEmail('');
      setType('general');
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      setError(e.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Feedback - 960 Dojo</title>
      </Head>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <h1 style={{ marginBottom: 8 }}>Feedback</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
          We'd love to hear your thoughts! Report bugs, suggest features, or share your experience.
        </p>

        {success ? (
          <div
            style={{
              padding: '1rem 1.2rem',
              borderRadius: 12,
              background: '#10b981',
              color: '#fff',
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            ✓ Thank you for your feedback!
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              padding: '1rem 1.2rem',
              borderRadius: 12,
              background: '#ef4444',
              color: '#fff',
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="type"
              style={{
                display: 'block',
                marginBottom: 8,
                color: '#e2e8f0',
                fontWeight: 600,
              }}
            >
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: '#0f131a',
                color: '#e2e8f0',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <option value="general">General feedback</option>
              <option value="bug">Bug report</option>
              <option value="feature">Feature request</option>
              <option value="other">Other</option>
            </select>
          </div>

          {!session ? (
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: 8,
                  color: '#e2e8f0',
                  fontWeight: 600,
                }}
              >
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #334155',
                  background: '#0f131a',
                  color: '#e2e8f0',
                  fontSize: 15,
                }}
              />
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
                So we can get back to you if needed
              </p>
            </div>
          ) : null}

          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="message"
              style={{
                display: 'block',
                marginBottom: 8,
                color: '#e2e8f0',
                fontWeight: 600,
              }}
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: '#0f131a',
                color: '#e2e8f0',
                fontSize: 15,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              {message.length} / 5000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || message.length < 10}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: submitting || message.length < 10 ? '#475569' : '#3b82f6',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting || message.length < 10 ? 'not-allowed' : 'pointer',
              opacity: submitting || message.length < 10 ? 0.6 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
