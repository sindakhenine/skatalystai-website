import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/PublicLayout';

export default function About() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-16 bg-light-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">{t('about.mission.title')}</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-text-secondary mb-4">
              {t('about.mission.p1')}
            </p>
            <p className="text-text-secondary mb-4">
              {t('about.mission.p2')}
            </p>
            <p className="text-text-secondary">
              {t('about.mission.p3')}
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-light-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">{t('about.whatWeDo.title')}</h2>
          <div className="space-y-6">
            <div className="bg-light-surface p-6 rounded-xl border border-light-border">
              <h3 className="font-semibold text-text-primary mb-2">{t('about.whatWeDo.ingestion')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.whatWeDo.ingestionDesc')}
              </p>
            </div>
            <div className="bg-light-surface p-6 rounded-xl border border-light-border">
              <h3 className="font-semibold text-text-primary mb-2">{t('about.whatWeDo.analysis')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.whatWeDo.analysisDesc')}
              </p>
            </div>
            <div className="bg-light-surface p-6 rounded-xl border border-light-border">
              <h3 className="font-semibold text-text-primary mb-2">{t('about.whatWeDo.output')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.whatWeDo.outputDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">{t('about.values.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="w-10 h-10 bg-ion/10 rounded-lg flex items-center justify-center text-ion mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('about.values.privacy')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.values.privacyDesc')}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-ion/10 rounded-lg flex items-center justify-center text-ion mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('about.values.speed')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.values.speedDesc')}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-ion/10 rounded-lg flex items-center justify-center text-ion mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('about.values.transparency')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.values.transparencyDesc')}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-ion/10 rounded-lg flex items-center justify-center text-ion mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{t('about.values.userFocus')}</h3>
              <p className="text-text-secondary text-sm">
                {t('about.values.userFocusDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-light-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {t('about.contact.title')}
          </h2>
          <p className="text-text-secondary mb-6">
            {t('about.contact.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hello@skatalystai.com"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button"
            >
              {t('about.contact.contactUs')}
            </a>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-text-primary bg-light-surface border border-light-border rounded-button hover:bg-light-soft transition-colors"
            >
              {t('about.contact.tryFree')}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
