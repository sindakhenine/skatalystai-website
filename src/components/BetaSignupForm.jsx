import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// =============================================================================
// BetaSignupForm
// -----------------------------------------------------------------------------
// Public beta-waitlist email-capture form. Posts to the backend
// POST /api/beta-signup endpoint, which saves the address to the launch
// waitlist and (once email is configured) sends a welcome confirmation.
//
// API base resolution: REACT_APP_API_URL (set in .env.development /
// .env.production; see .env.example). Falls back to the local backend so the
// form works out of the box in dev.
//
// Error handling is deliberately specific but safe: no stack traces, no raw
// server output, and NEVER a fake success. Each failure mode gets an honest,
// actionable message. See docs/BETA_SIGNUP_FORM_DEBUG.md for manual tests.
// =============================================================================

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Mirror of the backend's pragmatic check, for instant client-side feedback.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_EMAIL = 'contact@skatalystai.com';

// One place for every user-facing failure message.
const ERROR_MESSAGES = {
  invalidEmail: 'Enter a valid email address.',
  rateLimited: 'Too many attempts. Please try again in a moment.',
  serviceUnreachable: `The beta request service is not reachable. Please try again later or contact ${CONTACT_EMAIL}.`,
  networkBlocked: `The request could not reach the beta service. Please check your connection and try again, or email ${CONTACT_EMAIL}.`,
};

/**
 * Map a non-OK HTTP response to a safe, useful message.
 * Prefers the backend's own JSON `message` (it is written for end users);
 * falls back to honest generic wording when the body is not usable JSON
 * (proxy/hosting error pages, wrong deployment, etc.).
 */
function messageForResponse(res, data) {
  if (res.status === 400) return data.message || ERROR_MESSAGES.invalidEmail;
  if (res.status === 429) return data.message || ERROR_MESSAGES.rateLimited;
  if (data && typeof data.message === 'string' && data.message) return data.message;
  return ERROR_MESSAGES.serviceUnreachable;
}

export default function BetaSignupForm() {
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage(ERROR_MESSAGES.invalidEmail);
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/beta-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          locale: i18n?.language || null,
          source: 'website',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setAlreadySubscribed(Boolean(data.alreadySubscribed));
        // Only promise a confirmation email when the backend actually sent one.
        setEmailSent(Boolean(data.emailSent));
        setStatus('success');
        return;
      }

      setStatus('error');
      setMessage(messageForResponse(res, data));
    } catch {
      // fetch rejected: server down, DNS failure, or a CORS-blocked response.
      setStatus('error');
      setMessage(ERROR_MESSAGES.networkBlocked);
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
        {alreadySubscribed ? (
          <>
            <p className="text-base font-medium text-text-primary">You&rsquo;re already on the beta list.</p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              We&rsquo;ll email you when access opens.
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-medium text-text-primary">You&rsquo;re on the beta list.</p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              We&rsquo;ll email you when access opens.
              {emailSent && ' A confirmation email is on its way; check your inbox.'}
            </p>
          </>
        )}
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
        <p className="mt-3 text-sm text-red-600 text-left" role="alert">{message}</p>
      )}

      <p className="mt-3 text-xs text-text-secondary text-left">
        Join the beta launch list. No spam, just one email when access opens.
      </p>
    </form>
  );
}
