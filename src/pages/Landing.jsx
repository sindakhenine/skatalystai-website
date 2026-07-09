import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import BetaSignupForm from '../components/BetaSignupForm';

/*
 * Landing v3: concept-driven, visual-first.
 *
 * Concept: Data Chaos -> System Blueprint -> Owned Application.
 * Color semantics (docs/BRAND_SYSTEM_AUDIT.md, docs/DESIGN_DECISION_LOG.md):
 *   ION teal #2FA4A9 (the LOGO color) = the engine, analysis, intelligence
 *   GREEN #336600 = validated / owned / output states only
 *   GRAY #606060 = the unstructured "before" state, neutral structure
 * Copy rules: docs/SKATALYST_VOICE_AND_COPY_RULES.md (test-enforced).
 * All visuals are CSS/React. No images, no new dependencies.
 */

const ION = '#2FA4A9';
const GREEN = '#336600';
const GRAY = '#606060';

/* ---------- hero product map ------------------------------------------------ */

function ChaosChip({ children, i }) {
  const tilts = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3'];
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-dashed ${tilts[i % tilts.length]}`}
      style={{ color: GRAY, borderColor: '#B9B9B9' }}
    >
      {children}
    </span>
  );
}

function EngineRow({ children }) {
  return (
    <li className="flex items-center gap-2 text-xs font-medium text-white/95">
      <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" aria-hidden="true" />
      {children}
    </li>
  );
}

function OutputRow({ children }) {
  return (
    <li className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-text-primary border" style={{ borderColor: 'rgba(51,102,0,0.35)' }}>
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke={GREEN} strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </li>
  );
}

function FlowArrow() {
  return (
    <div className="flex md:flex-col items-center justify-center px-1" aria-hidden="true">
      <svg className="w-7 h-7 hidden md:block" fill="none" stroke={ION} strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      <svg className="w-6 h-6 md:hidden" fill="none" stroke={ION} strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}

/**
 * The product map: Data Chaos -> SKatalyst Engine -> Owned System.
 * This IS the pitch; the copy around it only captions it.
 */
function ProductMap() {
  return (
    <div className="mt-10 flex flex-col md:flex-row items-stretch justify-center gap-3 text-left" data-testid="product-map">
      {/* CHAOS */}
      <div className="flex-1 max-w-sm mx-auto md:mx-0 rounded-2xl p-4 border-2 border-dashed bg-[#FAFAFA]" style={{ borderColor: '#C9C9C9' }} aria-label="Your data today">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: GRAY }}>Your data today</p>
        <div className="flex flex-wrap gap-1.5">
          {['Excel files', 'PDFs', 'Folders', 'CSV exports', 'Notes', 'Screenshots', 'DB dumps', 'Duplicates', 'Missing fields'].map((c, i) => (
            <ChaosChip key={c} i={i}>{c}</ChaosChip>
          ))}
        </div>
      </div>

      <FlowArrow />

      {/* ENGINE (logo teal) */}
      <div className="flex-1 max-w-sm mx-auto md:mx-0 rounded-2xl p-4 shadow-lg" style={{ backgroundColor: '#25818A', backgroundImage: `linear-gradient(160deg, ${ION}, #22707A)` }} aria-label="The SKatalyst engine">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-white/80">SKatalyst engine</p>
        <ul className="space-y-2">
          <EngineRow>Inventory scan</EngineRow>
          <EngineRow>Context map</EngineRow>
          <EngineRow>Quality checks</EngineRow>
          <EngineRow>Architecture recommendation</EngineRow>
          <EngineRow>Source-to-output traceability</EngineRow>
          <EngineRow>Validation gates</EngineRow>
        </ul>
      </div>

      <FlowArrow />

      {/* OWNED SYSTEM (green) */}
      <div className="flex-1 max-w-sm mx-auto md:mx-0 rounded-2xl p-4 border-2" style={{ borderColor: GREEN, backgroundColor: 'rgba(51,102,0,0.04)' }} aria-label="Your owned system">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: GREEN }}>Your owned system</p>
        <ul className="space-y-1.5">
          {['Database schema', 'Documentation', 'Dashboard', 'CRUD app', 'Chatbot / RAG', 'Report', 'Docker export'].map((o) => (
            <OutputRow key={o}>{o}</OutputRow>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- mini UI previews (CSS only) ------------------------------------- */

function MiniDashboard() {
  const bars = [38, 62, 46, 78, 55, 88];
  return (
    <div className="h-16 flex items-end gap-1.5 px-1" aria-hidden="true">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: i === 5 ? GREEN : ION, opacity: i === 5 ? 1 : 0.55 + i * 0.08 }} />
      ))}
    </div>
  );
}

function MiniTable() {
  return (
    <div className="space-y-1" aria-hidden="true">
      {[0.9, 0.7, 0.8].map((w, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: ION, opacity: 0.6 }} />
          <div className="h-2 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
        </div>
      ))}
      <div className="flex gap-1.5 pt-1">
        <div className="h-4 w-12 rounded" style={{ backgroundColor: 'rgba(51,102,0,0.15)' }} />
        <div className="h-4 w-8 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function MiniSchema() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {['customers', 'orders'].map((t2) => (
        <div key={t2} className="flex-1 rounded border bg-white" style={{ borderColor: ION }}>
          <div className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded-t-sm" style={{ backgroundColor: ION }}>{t2}</div>
          <div className="p-1 space-y-0.5">
            <div className="h-1.5 w-4/5 rounded bg-gray-200" />
            <div className="h-1.5 w-3/5 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniChat() {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      <div className="ml-auto w-3/4 h-4 rounded-lg rounded-br-sm bg-gray-100" />
      <div className="w-4/5 h-6 rounded-lg rounded-bl-sm" style={{ backgroundColor: 'rgba(47,164,169,0.15)' }} />
    </div>
  );
}

function MiniDoc() {
  return (
    <div className="space-y-1" aria-hidden="true">
      <div className="h-2 w-2/5 rounded" style={{ backgroundColor: ION, opacity: 0.5 }} />
      {[0.95, 0.85, 0.6].map((w, i) => <div key={i} className="h-1.5 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />)}
    </div>
  );
}

function MiniExport() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="px-1.5 py-1 rounded text-[9px] font-mono font-bold text-white" style={{ backgroundColor: GREEN }}>.zip</div>
      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-full rounded bg-gray-200" />
        <div className="h-1.5 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ---------- shared bits ------------------------------------------------------ */

function SectionTitle({ title, sub }) {
  return (
    <div className="text-center mb-8 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary">{title}</h2>
      {sub && <p className="mt-2 text-base" style={{ color: GRAY }}>{sub}</p>}
    </div>
  );
}

/* ---------- page -------------------------------------------------------------- */

export default function Landing() {
  const blueprintCards = [
    ['Database schema', 'Typed tables from what your files actually contain.', <MiniSchema key="s" />],
    ['Dashboard', 'Charts from your real data, not demo numbers.', <MiniDashboard key="d" />],
    ['CRUD app', 'Forms and tables for your records.', <MiniTable key="t" />],
    ['Chatbot / RAG', 'Your documents, your own AI key.', <MiniChat key="c" />],
    ['Documentation', 'Readable docs for data and system.', <MiniDoc key="doc" />],
    ['Docker export', 'The whole result as code you run anywhere.', <MiniExport key="e" />],
  ];

  const steps = ['Upload or connect data', 'Scan inventory and context', 'Recommend structure and architecture', 'Generate apps and docs', 'Validate, export, own'];

  const comparisons = [
    ['BI tools', 'chart data you already cleaned. SKatalyst does the structuring first.'],
    ['App builders', 'start from empty screens. SKatalyst starts from your data.'],
    ['Consultants', 'take weeks. SKatalyst drafts and validates in one run.'],
    ['Generic AI chatbots', 'answer and forget. SKatalyst leaves structure, code, and docs behind.'],
  ];

  const useCases = ['Excel chaos to reporting database', 'Internal dashboard from scattered files', 'CRUD app for operational records', 'Docs from messy business data', 'AI / RAG / search preparation', 'Project, customer, product data cleanup'];

  const betaAvailable = ['Local file upload', 'Inventory scan', 'Quality findings', 'Architecture recommendations', 'Dashboard / CRUD / chatbot / report', 'Quality validation', 'Docker export / self-deploy', 'Data-rights requests'];
  const betaPreview = ['Cloud connector execution', 'Managed hosting', 'Paid billing', 'Fully automated deletion/export'];

  return (
    <PublicLayout>
      {/* ============ 1. HERO with product map ============ */}
      <section className="pt-16 pb-14 md:pt-24 md:pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight max-w-4xl mx-auto">
            Turn messy business data into{' '}
            <span style={{ color: ION }}>structured databases, dashboards, and apps you own.</span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: GRAY }}>
            From messy business data to organized systems — without vendor lock-in.
          </p>

          <ProductMap />

          <div id="request-access" className="mt-8 max-w-md mx-auto">
            <BetaSignupForm />
          </div>
          <div className="mt-3">
            <a
              href="#blueprint"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg border-2 transition-colors"
              style={{ borderColor: ION, color: ION }}
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-sm" style={{ color: GRAY }}>
            Beta preparation. Local uploads and export-first workflows supported first.
            Cloud connectors and managed hosting are Preview.
          </p>
        </div>
      </section>

      {/* ============ 2. PROBLEM STATEMENT ============ */}
      <section className="py-12" style={{ backgroundColor: '#2F3A44' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl md:text-3xl font-bold text-white leading-snug">
            The problem is not lack of AI.<br />
            <span style={{ color: ION }}>It is unstructured business data.</span>
          </p>
          <p className="mt-3 text-sm text-white/70">
            Files in. Structure, evidence, and working software out. That order matters.
          </p>
        </div>
      </section>

      {/* ============ 3. SYSTEM BLUEPRINT (outputs w/ mini previews) ============ */}
      <section id="blueprint" className="py-14 md:py-18 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="The system blueprint you get" sub="Concrete assets, generated from your data. Every card below is a real output." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueprintCards.map(([title, caption, preview]) => (
              <div key={title} className="rounded-xl border border-light-border bg-white p-4 hover:shadow-md transition-shadow">
                <div className="rounded-lg bg-[#FAFBFB] border border-light-divider p-3 mb-3 min-h-[76px] flex flex-col justify-center">{preview}</div>
                <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
                <p className="text-xs mt-0.5" style={{ color: GRAY }}>{caption}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm" style={{ color: GRAY }}>
            Plus: data quality findings, architecture recommendation with reasons, and a run report.
          </p>
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS (compact) ============ */}
      <section className="py-14" style={{ backgroundColor: '#F5F8F8' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Five steps, one run" />
          <ol className="flex flex-col md:flex-row items-stretch justify-between gap-3">
            {steps.map((step, i) => (
              <li key={step} className="flex-1 flex md:flex-col items-center gap-3 md:gap-2 md:text-center">
                <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: i === steps.length - 1 ? GREEN : ION }} aria-hidden="true">{i + 1}</span>
                <p className="text-sm font-medium text-text-primary">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 5. WHY DIFFERENT (grid, short) ============ */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Not a dashboard tool. Not a chatbot." sub="A structured, traceable, exportable foundation built from messy inputs." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comparisons.map(([name, rest]) => (
              <div key={name} className="rounded-xl border border-light-border p-4 text-sm">
                <span className="font-semibold text-text-primary">{name}</span>{' '}
                <span style={{ color: GRAY }}>{rest}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6. USE CASES (chips) ============ */}
      <section className="py-12" style={{ backgroundColor: '#F5F8F8' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle title="What people use it for" />
          <ul className="flex flex-wrap justify-center gap-2.5">
            {useCases.map((u) => (
              <li key={u} className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-light-border text-text-primary">{u}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 7. BETA SCOPE (compact badges) ============ */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Beta scope, stated plainly" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border-2 p-5" style={{ borderColor: GREEN }} aria-label="Available in beta">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GREEN }}>Available in beta</p>
              <ul className="flex flex-wrap gap-2">
                {betaAvailable.map((b) => (
                  <li key={b} className="px-2.5 py-1 rounded-md text-xs font-semibold text-text-primary" style={{ backgroundColor: 'rgba(51,102,0,0.08)' }}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-dashed p-5" style={{ borderColor: '#B9B9B9' }} aria-label="Preview, not yet launched">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GRAY }}>Preview / not yet launched</p>
              <ul className="flex flex-wrap gap-2">
                {betaPreview.map((b) => (
                  <li key={b} className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: 'rgba(96,96,96,0.08)', color: GRAY }}>{b}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs" style={{ color: GRAY }}>
                Details: <Link to="/beta-limitations" className="underline">beta limitations</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. OWNERSHIP BAND ============ */}
      <section className="py-14" style={{ backgroundColor: '#2F3A44' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-8 h-8 mx-auto mb-4" fill="none" stroke={GREEN} strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true" style={{ filter: 'brightness(2.2)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-white">You leave with assets, not a subscription hostage.</h2>
          <p className="mt-3 text-white/85">
            You own the generated structure, documentation, and export package. SKatalyst is
            designed to help you leave with usable assets, not trap your data inside another platform.
          </p>
        </div>
      </section>

      {/* ============ 9. FINAL CTA ============ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary">Want to test SKatalyst AI with your messy business data?</h2>
          <div className="mt-7 max-w-md mx-auto">
            <BetaSignupForm />
          </div>
          <p className="mt-4 text-sm" style={{ color: GRAY }}>
            Best for small teams with real files, spreadsheets, folders, or operational data.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
