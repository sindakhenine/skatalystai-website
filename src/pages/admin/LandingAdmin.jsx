/**
 * Landing Admin shell — /admin/leads
 *
 * Access model (the backend is authoritative):
 *  - The route is wrapped in ProtectedRoute (must be authenticated).
 *  - On mount we call GET /api/landing-admin/me. The backend enforces
 *    super-admin + the founder allowlist; anything but 200 renders the
 *    access-denied screen. Hiding this frontend route is NOT the security
 *    boundary — every API call is authorized server-side.
 *  - No link to this page exists in any public navigation.
 */
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminApi } from './adminApi';
import Overview from './Overview';
import Leads from './Leads';
import Templates from './Templates';
import Drafts from './Drafts';
import History from './History';
import logo from '../../assets/logo.png';

const SECTIONS = [
  ['overview', 'Overview'],
  ['leads', 'Leads'],
  ['templates', 'Email Templates'],
  ['drafts', 'Drafts'],
  ['history', 'Communication History'],
];

export default function LandingAdmin() {
  const api = useAdminApi();
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(null); // 401 | 403 | 'error'
  const [openLeadId, setOpenLeadId] = useState(null);

  // Section from the hash-like tail: /admin/leads, /admin/leads/templates, ...
  const tail = location.pathname.replace(/^\/admin\/leads\/?/, '') || 'leads';
  const section = SECTIONS.some(([k]) => k === tail) ? tail : 'leads';

  useEffect(() => {
    api.get('/me')
      .then(setMe)
      .catch((e) => setDenied(e.status === 401 ? 401 : e.status === 403 ? 403 : 'error'));
  }, [api]);

  if (denied) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-light-border rounded-2xl p-8 text-center">
          <img src={logo} alt="SKatalyst AI" className="h-12 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-text-primary">
            {denied === 403 ? 'Not authorized' : denied === 401 ? 'Sign-in required' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {denied === 403
              ? 'Your account does not have Landing Admin access.'
              : denied === 401
                ? 'Please sign in with an authorized account.'
                : 'The admin service could not be reached. Please try again.'}
          </p>
          <Link to="/" className="inline-block mt-5 px-4 py-2 text-sm text-white bg-slate rounded-button hover:bg-slate-hover">Back to site</Link>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Top bar */}
      <header className="bg-[#2F3A44] text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="" className="h-8 w-8 rounded" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">Landing Admin</p>
              <p className="text-[11px] text-white/60 leading-tight truncate">{me.email}</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-white/70 hover:text-white">← Back to skatalystai.com</Link>
        </div>
        {/* Section nav */}
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto" aria-label="Admin sections">
          {SECTIONS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => navigate(key === 'leads' ? '/admin/leads' : `/admin/leads/${key}`)}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${section === key ? 'border-[#2FA4A9] text-white' : 'border-transparent text-white/60 hover:text-white'}`}
              aria-current={section === key ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!me.emailAssetsConfigured && (section === 'templates' || section === 'drafts') && (
          <p className="mb-4 text-xs bg-yellow-50 text-yellow-800 rounded-lg px-3 py-2">
            Image uploads are not configured yet (email-assets bucket missing). Plain emails work normally.
          </p>
        )}
        {section === 'overview' && <Overview onOpenLead={(id) => { setOpenLeadId(id); navigate('/admin/leads'); }} />}
        {section === 'leads' && <Leads initialLeadId={openLeadId} onLeadClosed={() => setOpenLeadId(null)} bulkEmailEnabled={me.bulkEmailEnabled === true} />}
        {section === 'templates' && <Templates />}
        {section === 'drafts' && <Drafts bulkEmailEnabled={me.bulkEmailEnabled === true} />}
        {section === 'history' && <History />}
      </main>
    </div>
  );
}
