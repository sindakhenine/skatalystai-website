import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/PublicLayout';

// ============================================================
// Reusable Components
// ============================================================

// Hero proof chip
function ProofChip({ icon, text }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-full text-sm text-text-secondary dark:text-text-dark-secondary">
      <span className="text-ion">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

// Ownership pillar card
function OwnershipCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
      <div className="w-10 h-10 rounded-lg bg-ion/10 flex items-center justify-center text-ion mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">{description}</p>
    </div>
  );
}

// Connector card
function ConnectorCard({ name, available, icon }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
      available
        ? 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
        : 'bg-light-soft dark:bg-dark-soft border-light-divider dark:border-dark-divider opacity-60'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        available ? 'bg-success-bg text-success' : 'bg-light-soft dark:bg-dark-soft text-text-secondary'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{name}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        available
          ? 'bg-success-bg text-success'
          : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary'
      }`}>
        {available ? 'Available' : 'Coming soon'}
      </span>
    </div>
  );
}

// Output destination card
function DestinationCard({ title, subtitle, features, recommended, icon }) {
  return (
    <div className={`relative p-6 rounded-2xl border ${
      recommended
        ? 'border-ion bg-ion/5 dark:bg-ion/10'
        : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
    }`}>
      {recommended && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-ion text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-light-soft dark:bg-dark-soft flex items-center justify-center text-ion">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">{title}</h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
            <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Process step for 5-step flow
function ProcessStep({ number, title, description, icon, isLast }) {
  return (
    <div className="flex-1">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-14 h-14 bg-light-soft dark:bg-dark-soft rounded-2xl flex items-center justify-center">
              {icon}
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{number}</span>
            </div>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-text-primary dark:text-text-dark-primary text-center">{title}</h3>
          <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary text-center max-w-[120px]">{description}</p>
        </div>
        {!isLast && (
          <div className="hidden md:block w-full h-0.5 bg-light-border dark:bg-dark-border mx-2 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-light-border dark:border-dark-border rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
}

// Output card for "What You Get"
function OutputCard({ icon, title, description }) {
  return (
    <div className="p-5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-ion transition-colors">
      <div className="w-10 h-10 rounded-lg bg-light-soft dark:bg-dark-soft flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-2">{title}</h4>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{description}</p>
    </div>
  );
}

// KPI column
function KPIColumn({ title, icon, items }) {
  return (
    <div className="p-6 rounded-xl bg-light-soft dark:bg-dark-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-ion/10 flex items-center justify-center text-ion">
          {icon}
        </div>
        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-text-secondary dark:text-text-dark-secondary flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ion" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// App factory card
function AppCard({ icon, title, description }) {
  return (
    <div className="p-5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
      <div className="w-12 h-12 rounded-xl bg-light-soft dark:bg-dark-soft flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-2">{title}</h4>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{description}</p>
    </div>
  );
}

// Delivery pipeline step
function DeliveryStep({ number, title, description, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-ion rounded-full flex items-center justify-center text-sm font-bold text-white">
          {number}
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-ion/20 my-2" />}
      </div>
      <div className="pb-6">
        <h4 className="font-semibold text-text-primary dark:text-text-dark-primary">{title}</h4>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{description}</p>
      </div>
    </div>
  );
}

// Technical proof item
function TechItem({ text }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
      <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {text}
    </li>
  );
}

// Security promise item (for dark background)
function PromiseItem({ text }) {
  return (
    <li className="flex items-center gap-3 text-text-dark-secondary">
      <div className="w-5 h-5 rounded-full bg-ion/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-ion" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      {text}
    </li>
  );
}

// FAQ item
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-light-border dark:border-dark-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-medium text-text-primary dark:text-text-dark-primary pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-5 text-text-secondary dark:text-text-dark-secondary text-sm leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}

// FAQ Category with collapsible section
function FAQCategory({ title, icon, questions, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-ion/10 flex items-center justify-center text-ion flex-shrink-0">
          {icon}
        </div>
        <span className="flex-1 text-left font-semibold text-text-primary dark:text-text-dark-primary">
          {title}
        </span>
        <span className="text-xs text-text-secondary bg-light-soft dark:bg-dark-soft px-2 py-1 rounded-full">
          {questions.length} questions
        </span>
        <svg
          className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-2 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
          <div className="divide-y divide-light-border dark:divide-dark-border px-6">
            {questions.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Landing Page Component
// ============================================================

export default function Landing() {
  const { t } = useTranslation();

  // Icons for reuse
  const icons = {
    folder: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    upload: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    database: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>,
    cloud: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    server: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    document: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    code: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    check: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    lock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    download: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    camera: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    play: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    chat: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    brain: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    pen: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    desktop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    key: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  };

  const connectors = [
    { name: 'Local folders', available: true, icon: icons.folder },
    { name: 'File upload', available: true, icon: icons.upload },
    { name: 'User blob (Phase 1)', available: true, icon: icons.cloud },
    { name: 'User SQL (Phase 1)', available: true, icon: icons.database },
    { name: 'SharePoint / OneDrive', available: false, icon: icons.cloud },
    { name: 'S3 / Azure Blob', available: false, icon: icons.cloud },
    { name: 'PostgreSQL / MySQL', available: false, icon: icons.database },
    { name: 'Databricks / Data Lake', available: false, icon: icons.server },
  ];

  // FAQ categories - using translations
  const faqCategories = [
    {
      title: t('faq.categories.cloudSecurity.title'),
      icon: icons.shield,
      defaultOpen: true,
      questions: [
        { question: t('faq.categories.cloudSecurity.q1.question'), answer: t('faq.categories.cloudSecurity.q1.answer') },
        { question: t('faq.categories.cloudSecurity.q2.question'), answer: t('faq.categories.cloudSecurity.q2.answer') },
        { question: t('faq.categories.cloudSecurity.q3.question'), answer: t('faq.categories.cloudSecurity.q3.answer') },
        { question: t('faq.categories.cloudSecurity.q4.question'), answer: t('faq.categories.cloudSecurity.q4.answer') },
        { question: t('faq.categories.cloudSecurity.q5.question'), answer: t('faq.categories.cloudSecurity.q5.answer') },
        { question: t('faq.categories.cloudSecurity.q6.question'), answer: t('faq.categories.cloudSecurity.q6.answer') },
        { question: t('faq.categories.cloudSecurity.q7.question'), answer: t('faq.categories.cloudSecurity.q7.answer') },
      ],
    },
    {
      title: t('faq.categories.dataPrivacy.title'),
      icon: icons.lock,
      questions: [
        { question: t('faq.categories.dataPrivacy.q1.question'), answer: t('faq.categories.dataPrivacy.q1.answer') },
        { question: t('faq.categories.dataPrivacy.q2.question'), answer: t('faq.categories.dataPrivacy.q2.answer') },
        { question: t('faq.categories.dataPrivacy.q3.question'), answer: t('faq.categories.dataPrivacy.q3.answer') },
      ],
    },
    {
      title: t('faq.categories.platform.title'),
      icon: icons.server,
      questions: [
        { question: t('faq.categories.platform.q1.question'), answer: t('faq.categories.platform.q1.answer') },
        { question: t('faq.categories.platform.q2.question'), answer: t('faq.categories.platform.q2.answer') },
        { question: t('faq.categories.platform.q3.question'), answer: t('faq.categories.platform.q3.answer') },
        { question: t('faq.categories.platform.q4.question'), answer: t('faq.categories.platform.q4.answer') },
        { question: t('faq.categories.platform.q5.question'), answer: t('faq.categories.platform.q5.answer') },
      ],
    },
  ];

  // Legacy flat faqs for backward compatibility (if needed elsewhere)
  const faqs = faqCategories.flatMap(cat => cat.questions);

  return (
    <PublicLayout>
      {/* ============================================================ */}
      {/* SECTION 0: HERO */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-text-dark-primary leading-tight mb-6">
              {t('landing.hero.title')}{' '}
              <span className="text-ion">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary dark:text-text-dark-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button"
              >
                {t('landing.hero.cta')}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-text-primary dark:text-text-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-button hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
              >
                {t('landing.hero.secondaryCta')}
              </a>
            </div>

            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-8">
              {t('landing.hero.freeNote')}
            </p>

            {/* Proof chips */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ProofChip icon={icons.check} text={t('landing.hero.proofOwn')} />
              <ProofChip icon={icons.cloud} text={t('landing.hero.proofDeploy')} />
              <ProofChip icon={icons.shield} text={t('landing.hero.proofSecure')} />
              <ProofChip icon={icons.key} text={t('landing.hero.proofNoLock')} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1: OWNERSHIP - "You own everything. We enable it." */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              {t('landing.ownership.title')}
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-3xl mx-auto leading-relaxed">
              {t('landing.ownership.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <OwnershipCard
              icon={icons.database}
              title={t('landing.ownership.yourData')}
              description={t('landing.ownership.yourDataDesc')}
            />
            <OwnershipCard
              icon={icons.document}
              title={t('landing.ownership.yourOutputs')}
              description={t('landing.ownership.yourOutputsDesc')}
            />
            <OwnershipCard
              icon={icons.desktop}
              title={t('landing.ownership.yourApps')}
              description={t('landing.ownership.yourAppsDesc')}
            />
            <OwnershipCard
              icon={icons.user}
              title={t('landing.ownership.yourDecisions')}
              description={t('landing.ownership.yourDecisionsDesc')}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: CONNECT ANYTHING */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Connect the systems you already run
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Point SkatalystAI at your existing data sources. We handle the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {connectors.map((connector) => (
              <ConnectorCard key={connector.name} {...connector} />
            ))}
          </div>

          <p className="text-center text-sm text-text-secondary dark:text-text-dark-secondary mt-8">
            Scans are metadata-only first (fast & safe). Snapshots are immutable for reproducible runs.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: SAVE ANYWHERE */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Your outputs can be delivered anywhere
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Choose where your structured data lives. Switch anytime — nothing is locked in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <DestinationCard
              title="Your Infrastructure"
              subtitle="For enterprises"
              recommended={true}
              icon={icons.server}
              features={[
                'Your cloud: Azure / AWS / GCP',
                'Your DB: Postgres / MySQL / SQL Server',
                'Your storage: Blob / S3 / SharePoint',
                'Guided setup or done-for-you'
              ]}
            />
            <DestinationCard
              title="SkatalystAI Managed"
              subtitle="Fastest start"
              icon={icons.shield}
              features={[
                'Secure tenant-isolated workspace',
                'Retention controls',
                'Export anytime',
                'Perfect for pilots'
              ]}
            />
            <DestinationCard
              title="Local-only Mode"
              subtitle="For personal use"
              icon={icons.desktop}
              features={[
                'Outputs written locally',
                'Full offline capability',
                'Great for personal projects',
                'No cloud dependency'
              ]}
            />
          </div>

          {/* No infrastructure callout */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-light-soft dark:bg-dark-soft rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                No infrastructure? No problem. No lock-in either.
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
                Not every team starts with cloud storage, databases, or deployment pipelines. If you don't have infrastructure:
              </p>
              <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-ion flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  We can securely host analysis outputs temporarily
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-ion flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  We help you migrate them to your chosen environment
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-ion flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  We provide deployment and handover documentation
                </li>
              </ul>
              <p className="text-sm text-text-primary dark:text-text-dark-primary font-medium mt-4">
                Our goal is not to keep your data — it's to help you own it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: HOW IT WORKS (5 STEPS) */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              From chaos to production-ready systems
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Five steps. No coding required.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            <ProcessStep
              number={1}
              title="Connect"
              description="Files, cloud, databases"
              icon={<span className="text-ion">{icons.upload}</span>}
            />
            <ProcessStep
              number={2}
              title="Inventory"
              description="Size, counts, estimates"
              icon={<span className="text-ion">{icons.search}</span>}
            />
            <ProcessStep
              number={3}
              title="Snapshot"
              description="Immutable capture"
              icon={<span className="text-ion">{icons.camera}</span>}
            />
            <ProcessStep
              number={4}
              title="Run"
              description="With or without context"
              icon={<span className="text-ion">{icons.play}</span>}
            />
            <ProcessStep
              number={5}
              title="Deliver"
              description="Folders, SQL, apps"
              icon={<span className="text-ion">{icons.download}</span>}
              isLast
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary bg-light-surface dark:bg-dark-surface inline-block px-4 py-2 rounded-lg border border-light-border dark:border-dark-border">
              Re-run with new context without reuploading — using the same snapshot.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: WHAT YOU GET (OUTPUTS) */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Outputs that teams can actually ship
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Not just analysis — production-ready assets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <OutputCard
              icon={<span className="text-ion">{icons.folder}</span>}
              title="Organized folder structure"
              description="Logical hierarchy with naming conventions based on detected themes and dates."
            />
            <OutputCard
              icon={<span className="text-ion">{icons.database}</span>}
              title="SQL schema proposal"
              description="Production-ready tables with proper types, relationships, and indexes."
            />
            <OutputCard
              icon={<span className="text-ion">{icons.code}</span>}
              title="Migration scripts"
              description="Ready-to-run scripts for importing into your existing systems."
            />
            <OutputCard
              icon={<span className="text-ion">{icons.chart}</span>}
              title="KPI proposal pack"
              description="What to measure, why it matters, and required data fields."
            />
            <OutputCard
              icon={<span className="text-ion">{icons.document}</span>}
              title="Data quality report"
              description="Noise identification, duplicate detection, and gap analysis."
            />
            <OutputCard
              icon={<span className="text-ion">{icons.shield}</span>}
              title="Governance notes"
              description="Audit-friendly lineage and compliance documentation."
            />
          </div>

          {/* Ownership stamp */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-bg rounded-lg">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-success font-medium">
                Outputs are yours: schema + scripts + documentation. No vendor lock-in.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6: KPI & INSIGHT DISCOVERY */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              We don't just organize — we extract KPI opportunities
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              SkatalystAI proposes KPI definitions, required fields, and data gaps — before you invest in dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <KPIColumn
              title="Operational KPIs"
              icon={icons.chart}
              items={['Throughput metrics', 'Delay tracking', 'Failure rates', 'Compliance cycles']}
            />
            <KPIColumn
              title="Product/Customer KPIs"
              icon={icons.grid}
              items={['Quality indicators', 'Return rates', 'CSAT drivers', 'Engagement metrics']}
            />
            <KPIColumn
              title="Finance KPIs"
              icon={icons.database}
              items={['Cost drivers', 'Forecast signals', 'Revenue attribution', 'Budget variance']}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: APP FACTORY */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Turn structured outputs into deployable apps
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              From data to working systems — without building from scratch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <AppCard
              icon={<span className="text-ion">{icons.chart}</span>}
              title="Dashboard app"
              description="PowerBI-style or custom web dashboards"
            />
            <AppCard
              icon={<span className="text-ion">{icons.grid}</span>}
              title="CRUD management"
              description="Data entry and management interfaces"
            />
            <AppCard
              icon={<span className="text-ion">{icons.chat}</span>}
              title="Chatbot / RAG"
              description="Copilot over your structured data"
            />
            <AppCard
              icon={<span className="text-ion">{icons.brain}</span>}
              title="Prediction models"
              description="Scoped to your business questions"
            />
          </div>

          {/* Requirements freeze teaser */}
          <div className="mt-12 max-w-3xl mx-auto text-center">
            <div className="bg-light-soft dark:bg-dark-soft rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                Requirements freeze workflow
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
                You confirm scope → we generate a requirements pack → you e-sign → we deliver a deployable system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: DELIVERY PIPELINE */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              From proposal to signed delivery — without a full team
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              A structured process from analysis to production deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Pipeline */}
            <div>
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-6">Delivery pipeline</h3>
              <DeliveryStep
                number={1}
                title="Proposal pack generated"
                description="KPIs, structure, target system options"
              />
              <DeliveryStep
                number={2}
                title="Requirement freeze"
                description="Editable until locked"
              />
              <DeliveryStep
                number={3}
                title="Approval + e-signature"
                description="Simple digital acceptance"
              />
              <DeliveryStep
                number={4}
                title="Build + deploy + handover"
                description="Your infra or ours, plus documentation"
                isLast
              />
            </div>

            {/* Documentation deliverables */}
            <div>
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-6">Documentation deliverables</h3>
              <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
                <ul className="space-y-3">
                  <TechItem text="Architecture summary" />
                  <TechItem text="Data model docs" />
                  <TechItem text="Connector inventory record" />
                  <TechItem text="Run manifests & cost ledger" />
                  <TechItem text="Deployment guide (if app delivered)" />
                  <TechItem text="Ownership statement" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9: SECURITY BY DESIGN */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Security by design — responsibility without lock-in
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-3xl mx-auto leading-relaxed">
              We are responsible for securing every step of the analysis and delivery process.
              You remain the owner of the assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">Processing security</h3>
              <ul className="space-y-3">
                <TechItem text="Encrypted connections and credential handling" />
                <TechItem text="Tenant-isolated processing" />
                <TechItem text="Audit-ready logs and traceability" />
                <TechItem text="Controlled access and least-privilege execution" />
              </ul>
            </div>
            <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">Data handling</h3>
              <ul className="space-y-3">
                <TechItem text="Metadata-first scanning (fast & safe)" />
                <TechItem text="No raw file persistence on our servers" />
                <TechItem text="Configurable retention policies" />
                <TechItem text="Full deletion on request" />
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-text-secondary dark:text-text-dark-secondary mt-8">
            We never monetize, resell, or reuse your data. When outputs are delivered, ownership transfers entirely to you.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10: SECURITY PROMISE (Dark Block) */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              The SkatalystAI Security Promise
            </h2>
          </div>

          <ul className="space-y-4 max-w-md mx-auto">
            <PromiseItem text="We do not own your data" />
            <PromiseItem text="We do not lock you into our platform" />
            <PromiseItem text="We do not deploy without your approval" />
            <PromiseItem text="We do not keep what you choose to delete" />
          </ul>

          <p className="text-center text-text-dark-secondary mt-10 text-lg">
            We help you turn data into systems — and then step back.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11: TECHNICAL PROOF */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              Built like production software
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
              Enterprise-grade architecture from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">Processing</h3>
              <ul className="space-y-3">
                <TechItem text="Metadata-first scanning" />
                <TechItem text="Immutable snapshots" />
                <TechItem text="Artifact caching (reuse, no reupload)" />
                <TechItem text="Run state machine + monitoring" />
                <TechItem text="Cost ledger (estimated vs actual)" />
                <TechItem text="Multi-tenancy foundation" />
              </ul>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">Infrastructure</h3>
              <ul className="space-y-3">
                <TechItem text="Encryption for credentials (vault)" />
                <TechItem text="Scoped access & least privilege" />
                <TechItem text="Safe connector gating" />
                <TechItem text="Retention policies (by plan)" />
                <TechItem text="Tenant isolation" />
                <TechItem text="Security review available" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 12: CTA STRIP */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            Ready to organize your data without building a team?
          </h2>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-8">
            Start with 1GB free. See results in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button"
            >
              Start organizing free
            </Link>
            <a
              href="mailto:contact@skatalystai.com"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-text-primary dark:text-text-dark-primary border border-light-border dark:border-dark-border rounded-button hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 13: FAQ */}
      {/* ============================================================ */}
      <section className="py-20 bg-light-soft dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            {faqCategories.map((category) => (
              <FAQCategory
                key={category.title}
                title={category.title}
                icon={category.icon}
                questions={category.questions}
                defaultOpen={category.defaultOpen}
              />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
