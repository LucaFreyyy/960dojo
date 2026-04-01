import Head from 'next/head';
import { useState } from 'react';
import { useSupabaseSession } from '../lib/SessionContext';
import { hashEmail } from '../lib/hashEmail';
import Button from '../components/Button';
import AuthField from '../components/AuthField';
import SectionTitle from '../components/SectionTitle';

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
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = message.length >= 10 && !submitting;

  return (
    <>
      <Head>
        <title>Feedback - 960 Dojo</title>
      </Head>
      <main className="page-shell page-shell--narrow">
        <SectionTitle title="Feedback" />
        <div className="auth-card feedback-card">
          <p className="intro-lead">
            We&apos;d love to hear your thoughts. Report bugs, suggest features, or share your experience.
          </p>

          {success ? (
            <div className="alert alert--success mb-sm" role="status">
              Thank you for your feedback!
            </div>
          ) : null}

          {error ? (
            <div className="alert alert--error mb-sm" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="stack stack--gap-md">
            <div className="auth-field">
              <label htmlFor="type" className="auth-field__label">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="file-select feedback-form__select"
              >
                <option value="general">General feedback</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="other">Other</option>
              </select>
            </div>

            {!session ? (
              <>
                <AuthField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
                <p className="text-muted field-hint">
                  So we can get back to you if needed
                </p>
              </>
            ) : null}

            <div className="auth-field">
              <label htmlFor="message" className="auth-field__label">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                rows={8}
                className="form-textarea"
              />
              <p className="text-muted field-hint">
                {message.length} / 5000 characters
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn--block"
              disabled={!canSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
