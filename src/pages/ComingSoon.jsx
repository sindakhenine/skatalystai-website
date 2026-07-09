import React from 'react';
import logo from '../assets/logo.png';
import { BETA_CONTACT_EMAIL } from '../config/appConfig';

// =============================================================================
// ComingSoon / Private Beta landing
// -----------------------------------------------------------------------------
// In PRODUCTION (PUBLIC_LOGIN_ENABLED === false) this is the public face of
// skatalystai.com: it is shown as the homepage and anywhere a visitor would
// otherwise reach the login / sign-up flow or a private /app/* route.
//
// It is deliberately NOT styled like an error or "under construction" page. It
// presents SKatalyst AI as intentionally in private beta and gives invited
// testers / enterprise partners a clear way to request access. It reuses the
// public marketing design tokens (light-surface, ion accent, slate CTA).
// =============================================================================

// Pre-filled access-request email.
const REQUEST_ACCESS_MAILTO =
  `mailto:${BETA_CONTACT_EMAIL}?subject=${encodeURIComponent('Private Beta Access Request')}`;

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Header with logo */}
      <header className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center">
          <img src={logo} alt="SKatalyst AI" className="h-16 w-auto" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-light-surface border border-light-border rounded-2xl shadow-md px-6 py-10 sm:px-12 sm:py-14 text-center">
            {/* Status pill */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-soft border border-light-border text-xs font-medium text-ion">
              <span className="h-2 w-2 rounded-full bg-ion" />
              Private Beta
            </span>

            {/* Headline */}
            <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
              SKatalyst AI is currently in private beta
            </h1>

            {/* Product description */}
            <p className="mt-5 text-base sm:text-lg text-text-secondary leading-relaxed">
              We&rsquo;re building a context-aware AI platform that helps teams
              turn scattered data into apps, dashboards, reports and copilots.
            </p>

            {/* Coming soon line */}
            <p className="mt-4 text-base font-medium text-text-primary">
              Public access is coming soon.
            </p>

            {/* Request Access CTA */}
            <div className="mt-8">
              <a
                href={REQUEST_ACCESS_MAILTO}
                className="inline-flex items-center justify-center px-7 py-3 text-sm font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button"
              >
                Request Access
              </a>
            </div>

            {/* Contact line below the button */}
            <p className="mt-4 text-sm text-text-secondary">
              For private beta access, contact us at{' '}
              <a
                href={`mailto:${BETA_CONTACT_EMAIL}`}
                className="text-text-primary hover:text-ion transition-colors"
              >
                {BETA_CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} SKatalyst AI. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
