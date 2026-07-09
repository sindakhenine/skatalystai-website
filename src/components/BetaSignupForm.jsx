import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// =============================================================================
// BetaSignupForm
// -----------------------------------------------------------------------------
// Public "notify me when the October beta opens" email-capture form. Posts to
// the backend POST /api/beta-signup endpoint, which saves the address to the
// launch waitlist and (once email is configured) sends a welcome confirmation.
//
// Self-contained: resolves the API base the same way the rest of the app does
// (REACT_APP_API_URL) so it works in dev and production without extra wiring.
// =============================================================================

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Mirror of the backend's pragmatic check — just to give instant feedback.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BetaSignupForm() {
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/beta-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale: i18n?.language || null }),
      });

      if (res.ok) {
        setStatus('success');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setStatus('error');
      setMessage(
        res.status === 429
          ? 'Too many attempts. Please try again in a moment.'
          : data.message || 'Something went wrong. Please try again.'
      );
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-light-soft border border-light-border mb-4">
          <svg className="h-6 w-6 text-ion" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-medium text-text-primary">You&rsquo;re on the list!</p>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          We&rsquo;ll email you the moment your access is ready for the October beta.
          Check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setMessage('');
            }
          }}
          placeholder="you@company.com"
          aria-label="Email address"
          disabled={status === 'submitting'}
          className="flex-1 px-4 py-3 text-sm rounded-button bg-light-surface border border-light-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ion focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'submitting' ? 'Joining…' : 'Notify me'}
        </button>
      </div>

      {status === 'error' && message && (
        <p className="mt-3 text-sm text-red-600 text-left">{message}</p>
      )}

      <p className="mt-3 text-xs text-text-secondary text-left">
        Join the launch list for the beta opening in October. No spam, just one email when it&rsquo;s ready.
      </p>
    </form>
  );
}
