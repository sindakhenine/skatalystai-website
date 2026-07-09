import React from 'react';
import PublicLayout from '../../components/PublicLayout';

/**
 * Shared shell for legal/product pages: consistent layout, honest
 * draft-status banner, and simple section rendering from data.
 *
 * sections: [{ heading, body: string | string[] (paragraphs), list: string[] }]
 */
export default function LegalPageShell({ title, updated, intro, sections, ownerReview = true }) {
  return (
    <PublicLayout>
      <div className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{title}</h1>
          <p className="text-text-secondary mb-4">Last updated: {updated}</p>

          {ownerReview && (
            <div className="mb-8 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-text-primary">
              Draft for the SKatalyst beta. This page is written for accuracy, not as legal advice;
              a legal review is planned before full commercial launch.
            </div>
          )}

          {intro && <p className="text-text-secondary mb-8">{intro}</p>}

          <div className="max-w-none">
            {sections.map((s, i) => (
              <section key={i} className="mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-3">{`${i + 1}. ${s.heading}`}</h2>
                {(Array.isArray(s.body) ? s.body : s.body ? [s.body] : []).map((p, j) => (
                  <p key={j} className="text-text-secondary mb-3">{p}</p>
                ))}
                {s.list && (
                  <ul className="list-disc pl-6 space-y-1.5 mb-3">
                    {s.list.map((item, j) => (
                      <li key={j} className="text-text-secondary">{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
