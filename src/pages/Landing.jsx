import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import BetaSignupForm from '../components/BetaSignupForm';

/**
 * Landing page — redesigned for 5-second clarity.
 *
 * Rules baked in (do not regress):
 *  - The visitor must understand WHAT / PROBLEM / OUTPUT / DIFFERENCE /
 *    BETA SCOPE / NEXT ACTION without reading long paragraphs.
 *  - Truthful: no billing, no managed production hosting, cloud connectors
 *    are Preview, no "unlimited", no revolutionary-AI fluff.
 *  - Visual-first: before→after diagram, output cards, 5-step timeline,
 *    beta badges, all CSS/React, no image assets, no new dependencies.
 *  - Page-local brand accents (SKatalyst green #336600, neuron gray #606060)
 *    per founder direction; the LOCKED product tokens are not modified.
 */

const GREEN = '#336600';
const GRAY = '#606060';

/* ---------- small building blocks ---------------------------------------- */

function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="text-center mb-10 max-w-3xl mx-auto">
      {kicker && (
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GREEN }}>{kicker}</p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary">{title}</h2>
      {sub && <p className="mt-3 text-base md:text-lg" style={{ color: GRAY }}>{sub}</p>}
    </div>
  );
}

function Badge({ children, tone = 'green' }) {
  const styles = tone === 'green'
    ? { backgroundColor: 'rgba(51,102,0,0.08)', color: GREEN }
    : { backgroundColor: 'rgba(96,96,96,0.10)', color: GRAY };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={styles}>
      {children}
    </span>
  );
}

function CheckIcon({ color = GREEN }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke={color} strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg className="w-7 h-7 md:hidden" fill="none" stroke={GREEN} strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg className="w-8 h-8 hidden md:block" fill="none" stroke={GREEN} strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

/* ---------- page ----------------------------------------------------------- */

export default function Landing() {
  const messyItems = ['Messy folders', 'Excel files', 'PDFs', 'Screenshots', 'CSV exports', 'Scattered notes', 'Unknown data quality'];

  const cleanItems = ['Clean database schema', 'Documentation', 'Dashboard', 'CRUD app', 'Chatbot / RAG', 'Report', 'Docker export'];

  const outputs = [
    ['Organized database structure', 'A clean, typed schema built from what your files actually contain.'],
    ['Data quality findings', 'Duplicates, gaps, format problems, and PII flags, found before they bite.'],
    ['Architecture recommendation', 'A concrete proposal for how your data should be structured, with reasons.'],
    ['Documentation', 'Readable docs describing your data, structure, and generated system.'],
    ['Dashboard', 'Charts built from your real data, not demo numbers.'],
    ['CRUD app', 'Forms and tables to manage your records, generated from your schema.'],
    ['Chatbot / RAG', 'Ask questions about your documents, running on your own AI key.'],
    ['Reports', 'Summaries of what was found, organized, and built.'],
    ['Docker export / self-deploy package', 'The whole result as code you run anywhere. No lock-in.'],
  ];

  const steps = [
    ['Upload or connect data', 'Drop in files, spreadsheets, and exports. Cloud sources are available in Preview.'],
    ['SKatalyst scans inventory and context', 'It reads what is there: files, structure, content, and your business context.'],
    ['It recommends structure and architecture', 'You see a proposed schema and app architecture, with the evidence behind it.'],
    ['It generates apps and documentation', 'Dashboard, CRUD app, chatbot, reports, and docs are generated from the confirmed structure.'],
    ['You validate, export, and own the result', 'Quality gates check the output; then you download the package and run it yourself.'],
  ];

  const comparisons = [
    ['BI tools', 'show charts on data you already cleaned. SKatalyst does the cleaning and structuring first.'],
    ['App builders', 'give you empty screens to configure. SKatalyst generates the app from your actual data.'],
    ['Consultants', 'deliver the same in weeks. SKatalyst gives you a validated draft in one run.'],
    ['Generic AI chatbots', 'answer and forget. SKatalyst produces structure, code, and documentation you keep.'],
  ];

  const differentiators = [
    'Context-aware analysis of your real files',
    'Source-to-output traceability',
    'You own every output',
    'No vendor lock-in, export-first',
    'Quality gates before anything is exported',
    'Modular generated apps (take what you need)',
    'Beta-safe honesty: preview features are labeled',
  ];

  const useCases = [
    'Turn Excel chaos into a reporting database',
    'Build an internal dashboard from scattered files',
    'Generate a CRUD app for operational records',
    'Create documentation from messy business data',
    'Prepare data for AI, RAG, and search',
    'Clean up project, customer, and product data',
  ];

  const betaAvailable = [
    'Local file upload',
    'Inventory scan',
    'Data quality findings',
    'Architecture recommendations',
    'Dashboard / CRUD / chatbot / report generation',
    'Quality validation',
    'Docker export / self-deploy',
    'Data rights request workflow',
  ];

  const betaPreview = [
    'Cloud connector execution',
    'Managed hosting',
    'Paid billing',
    'Fully automated deletion/export',
  ];

  return (
    <PublicLayout>
      {/* ============ 1. HERO ============ */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge>From messy business data to organized systems — without vendor lock-in</Badge>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
            Turn messy business data into{' '}
            <span style={{ color: GREEN }}>structured databases, dashboards, and apps you own.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: GRAY }}>
            SKatalyst AI scans your files and business context, organizes the data, recommends the
            right structure, and generates documentation, dashboards, CRUD apps, reports, and
            chatbot/RAG experiences — with exportable code and no vendor lock-in.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            {/* Real waitlist form (backend-backed) = "Request beta access" */}
            <BetaSignupForm />
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg border-2 transition-colors hover:bg-[rgba(51,102,0,0.06)]"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              See how it works
            </a>
          </div>

          <p className="mt-6 text-sm" style={{ color: GRAY }}>
            Private/public beta preparation. Local uploads and export-first workflows supported
            first. Cloud connectors and managed hosting are Preview.
          </p>
        </div>
      </section>

      {/* ============ 2. BEFORE → AFTER ============ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#F7F9F5' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            kicker="The 5-second version"
            title="Before and after SKatalyst"
            sub="One run: scan, understand, organize, validate, generate."
          />
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-5 md:gap-6">
            {/* BEFORE */}
            <div className="flex-1 max-w-md mx-auto md:mx-0 rounded-2xl border-2 border-dashed p-6 bg-white" style={{ borderColor: GRAY }} aria-label="Before: messy inputs">
              <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: GRAY }}>Before</p>
              <ul className="flex flex-wrap gap-2">
                {messyItems.map((item) => (
                  <li key={item} className="px-3 py-1.5 rounded-lg text-sm bg-[rgba(96,96,96,0.08)] -rotate-1 odd:rotate-1" style={{ color: GRAY }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ARROW */}
            <div className="flex md:flex-col items-center justify-center gap-2 px-2">
              <ArrowRight />
              <ArrowDown />
              <p className="text-xs font-semibold text-center max-w-[130px]" style={{ color: GREEN }}>
                SKatalyst AI scans, understands, organizes, validates, generates
              </p>
            </div>

            {/* AFTER */}
            <div className="flex-1 max-w-md mx-auto md:mx-0 rounded-2xl border-2 p-6 bg-white shadow-sm" style={{ borderColor: GREEN }} aria-label="After: structured outputs">
              <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: GREEN }}>After</p>
              <ul className="space-y-2">
                {cleanItems.map((item) => (
                  <li key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-primary bg-[rgba(51,102,0,0.06)]">
                    <CheckIcon /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. WHAT YOU GET ============ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="What you get" sub="Every run produces concrete, usable assets." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-light-border bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: GREEN }} aria-hidden="true" />
                  <h3 className="font-semibold text-text-primary">{title}</h3>
                </div>
                <p className="text-sm" style={{ color: GRAY }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-16 md:py-20" style={{ backgroundColor: '#F7F9F5' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="How it works" sub="Five steps from upload to ownership." />
          <ol className="space-y-0">
            {steps.map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                {/* timeline */}
                <div className="flex flex-col items-center">
                  <span
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: GREEN }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && <span className="w-0.5 flex-1 my-1" style={{ backgroundColor: 'rgba(51,102,0,0.25)' }} aria-hidden="true" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-lg text-text-primary pt-1.5">{title}</h3>
                  <p className="text-sm mt-1" style={{ color: GRAY }}>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 5. WHY IT IS DIFFERENT ============ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Why it is different"
            sub="SKatalyst AI is not just a dashboard tool and not just a chatbot. It creates a structured, traceable, exportable data and application foundation from messy business inputs."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {comparisons.map(([name, rest]) => (
              <div key={name} className="rounded-xl border border-light-border p-5">
                <p className="text-sm">
                  <span className="font-semibold text-text-primary">{name}</span>{' '}
                  <span style={{ color: GRAY }}>{rest}</span>
                </p>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {differentiators.map((d) => (
              <li key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[rgba(51,102,0,0.06)] text-text-primary">
                <CheckIcon /> {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 6. USE CASES ============ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#F7F9F5' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="What people use it for" sub="Small teams with real files and real mess." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase) => (
              <div key={useCase} className="rounded-xl bg-white border border-light-border p-5 flex items-start gap-3">
                <span className="mt-1 w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: GREEN }} aria-hidden="true" />
                <p className="text-sm font-medium text-text-primary">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. BETA SCOPE ============ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            kicker="No surprises"
            title="What the beta supports today"
            sub="We label what works and what is still preview. That honesty is part of the product."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border-2 p-6" style={{ borderColor: GREEN }}>
              <Badge>Available in beta</Badge>
              <ul className="mt-4 space-y-2.5">
                {betaAvailable.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-primary">
                    <CheckIcon /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-dashed p-6" style={{ borderColor: GRAY }}>
              <Badge tone="gray">Preview / not yet fully launched</Badge>
              <ul className="mt-4 space-y-2.5">
                {betaPreview.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: GRAY }}>
                    <span className="w-4 h-4 shrink-0 rounded-full border-2 border-current opacity-60" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs" style={{ color: GRAY }}>
                Full details on the <Link to="/beta-limitations" className="underline">beta limitations page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. OWNERSHIP ============ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: GREEN }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">You leave with assets, not a subscription hostage.</h2>
          <p className="mt-4 text-lg text-white/85 leading-relaxed">
            You own the generated structure, documentation, and export package. SKatalyst is
            designed to help you leave with usable assets, not trap your data inside another
            platform.
          </p>
        </div>
      </section>

      {/* ============ 9. FINAL CTA ============ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
            Want to test SKatalyst AI with your messy business data?
          </h2>
          <div className="mt-8 max-w-md mx-auto">
            <BetaSignupForm />
          </div>
          <p className="mt-5 text-sm" style={{ color: GRAY }}>
            Best for small teams with real files, spreadsheets, folders, or operational data they
            want to organize into a usable system.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
