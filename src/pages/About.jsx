import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

/**
 * About page — answers the questions the old one didn't:
 * who is behind this, why it exists, what problem it solves, what stage it
 * is in, and what values guide it. Honest: founder-built, beta/pre-launch,
 * Germany/EU, no invented company details, no fake team size.
 */

const GREEN = '#336600';
const GRAY = '#606060';

function ValueCard({ title, text }) {
  return (
    <div className="rounded-xl border border-light-border bg-white p-5">
      <h3 className="font-semibold text-text-primary mb-1.5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: GREEN }} aria-hidden="true" />
        {title}
      </h3>
      <p className="text-sm" style={{ color: GRAY }}>{text}</p>
    </div>
  );
}

export default function About() {
  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">About SKatalyst AI</h1>
          <p className="text-xl" style={{ color: GRAY }}>
            From messy business data to organized systems — without vendor lock-in.
          </p>
        </div>
      </section>

      {/* Why it exists */}
      <section className="py-14" style={{ backgroundColor: '#F7F9F5' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Why SKatalyst exists</h2>
          <p className="mb-4 leading-relaxed" style={{ color: GRAY }}>
            SKatalyst AI was created to solve a common business problem: valuable data is
            everywhere, but rarely organized enough to become useful software. Teams have
            spreadsheets, folders, PDFs, exports, and notes — but turning that into a database,
            dashboard, app, or AI-ready knowledge system usually requires consultants, developers,
            and weeks of translation.
          </p>
          <p className="leading-relaxed" style={{ color: GRAY }}>
            SKatalyst AI is being built as an export-first, no-lock-in platform that helps
            businesses transform messy inputs into structured, documented, validated systems they
            can own.
          </p>
        </div>
      </section>

      {/* Who is behind it + stage */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Who is behind it</h2>
          <p className="mb-4 leading-relaxed" style={{ color: GRAY }}>
            SKatalyst AI is founder-built and operated from Germany. It is not a large company and
            does not pretend to be one: one founder, working directly with early users, building
            the product around real messy data instead of slide decks. That means fast, direct
            answers, and honest labels on anything that is not finished yet.
          </p>
          <h2 className="text-2xl font-bold text-text-primary mb-4 mt-10">Where the product stands</h2>
          <p className="leading-relaxed" style={{ color: GRAY }}>
            SKatalyst AI is in beta / pre-launch. The core pipeline works end to end: local
            uploads, analysis, structure recommendations, generated dashboards, CRUD apps,
            chatbot/RAG and reports, quality validation, and Docker export for self-deployment.
            Cloud connectors and managed hosting exist in preview form and are labeled as such.
            Billing is not active; the beta is free. The full, current list is on the{' '}
            <Link to="/beta-limitations" className="underline" style={{ color: GREEN }}>beta limitations page</Link>.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-14" style={{ backgroundColor: '#F7F9F5' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">What guides the product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValueCard
              title="Ownership over lock-in"
              text="Everything SKatalyst generates (schema, docs, apps) leaves the platform as an export package you run yourself."
            />
            <ValueCard
              title="Honesty over hype"
              text="Preview features are labeled preview. Beta limits are published. Nothing is claimed as production until it is."
            />
            <ValueCard
              title="Evidence over magic"
              text="Recommendations trace back to your actual files, and quality gates run before anything is exported."
            />
            <ValueCard
              title="Privacy by default"
              text="Isolated workspaces, encrypted credentials, append-only audit logs, EU hosting, and a working data-rights process."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-3">Talk to us or try it</h2>
          <p style={{ color: GRAY }}>
            Request beta access from the <Link to="/" className="underline" style={{ color: GREEN }}>landing page</Link>,
            or reach us through the <Link to="/contact" className="underline" style={{ color: GREEN }}>contact page</Link>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
