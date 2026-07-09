import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../i18n';
import logo from '../assets/logo.png';

// Icons for theme and language
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

// Navigation link component
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive ? 'text-ion' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

// Public header for marketing pages
function PublicHeader() {
  const { t, i18n } = useTranslation();
  const { setTheme, effectiveTheme } = useTheme();
  const { changeLanguage: setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setLangDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-surface dark:bg-gray-900 border-b border-light-divider dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SkatalystAI" className="h-20 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/pricing">{t('nav.billing')}</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white hover:bg-light-soft dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={t('settings.language.title')}
              >
                <GlobeIcon />
              </button>
              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                          i18n.language === lang.code
                            ? 'text-ion font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white hover:bg-light-soft dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={effectiveTheme === 'dark' ? t('settings.theme.light') : t('settings.theme.dark')}
            >
              {effectiveTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="w-px h-6 bg-light-border dark:bg-gray-700 mx-1" />

            <Link
              to="/login"
              className="text-sm font-medium text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white transition-colors px-3 py-2"
            >
              {t('common.login')}
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate rounded-button hover:bg-slate-hover transition-colors shadow-button"
            >
              {t('common.getStarted')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// Footer for marketing pages
function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-light-soft border-t border-light-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('footer.product')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('nav.billing')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/beta-limitations" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.betaLimitations', 'Beta Limitations')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.support', 'Contact & Support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <a href="mailto:contact@skatalystai.com" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/legal/privacy" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/data-rights" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.dataRights', 'Data Rights')}
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.security', 'Security')}
                </Link>
              </li>
              <li>
                <Link to="/subprocessors" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.subprocessors', 'Subprocessors')}
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.impressum', 'Impressum')}
                </Link>
              </li>
              <li>
                <Link to="/legal/disclaimer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-light-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SkatalystAI" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} SkatalystAI. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main layout wrapper
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-light-surface">
      <PublicHeader />
      <main className="pt-24">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
