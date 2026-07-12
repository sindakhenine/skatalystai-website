/** Landing Admin — Overview: real metrics only, every number DB-backed. */
import React, { useEffect, useState } from 'react';
import { useAdminApi, fmtDate, LEAD_STATUS_LABELS } from './adminApi';

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-light-border bg-white p-4">
      <p className="text-2xl font-bold" style={accent ? { color: accent } : undefined}>{value ?? '—'}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

export default function Overview({ onOpenLead }) {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/metrics').then(setData).catch((e) => setError(e.message));
  }, [api]);

  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-text-secondary">Loading metrics…</p>;

  const t = data.totals || {};
  const s = data.byLeadStatus || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Total leads" value={t.total} />
        <Stat label="New (7 days)" value={t.new_7d} accent="#2FA4A9" />
        <Stat label="Qualified" value={s.qualified || 0} />
        <Stat label="Invited" value={t.invited} />
        <Stat label="Converted" value={t.converted} accent="#336600" />
        <Stat label="Unsubscribed / suppressed" value={(t.unsubscribed || 0) + (t.suppressed || 0)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Confirmation emails sent" value={data.welcomeEmail?.welcome_sent} />
        <Stat label="Confirmation not sent yet" value={data.welcomeEmail?.welcome_not_sent} />
        <Stat label="Admin emails submitted" value={data.communications?.submitted} />
        <Stat label="Failed emails" value={data.communications?.failed} accent={data.communications?.failed > 0 ? '#dc2626' : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-light-border bg-white p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Recent signups</h3>
          <ul className="divide-y divide-light-divider">
            {(data.recentSignups || []).map((lead) => (
              <li key={lead.id}>
                <button onClick={() => onOpenLead && onOpenLead(lead.id)} className="w-full flex items-center justify-between py-2 text-left hover:bg-light-soft rounded px-1">
                  <span className="text-sm text-text-primary truncate">{lead.name || lead.email}</span>
                  <span className="text-xs text-text-secondary shrink-0 ml-2">{fmtDate(lead.created_at)}</span>
                </button>
              </li>
            ))}
            {(data.recentSignups || []).length === 0 && <li className="text-sm text-text-secondary py-2">No signups yet.</li>}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-light-border bg-white p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Pipeline</h3>
            <ul className="space-y-1.5">
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{label}</span>
                  <span className="font-medium text-text-primary">{s[key] || 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-light-border bg-white p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Signups by source</h3>
            <ul className="space-y-1.5">
              {(data.bySource || []).map((row) => (
                <li key={row.source || 'unknown'} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{row.source || 'unknown'}</span>
                  <span className="font-medium text-text-primary">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
