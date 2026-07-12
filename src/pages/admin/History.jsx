/**
 * Landing Admin — Communication History (global): every email the system sent
 * to any lead, with truthful provider states and exact content snapshots.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAdminApi, toQuery, fmtDate, STATE_LABELS, STATE_BADGE } from './adminApi';

export default function History() {
  const api = useAdminApi();
  const [filters, setFilters] = useState({ state: '', type: '', recipient: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState(null);

  const load = useCallback(() => {
    api.get(`/communications${toQuery({ ...filters, page, pageSize: 25 })}`).then(setData).catch((e) => setError(e.message));
  }, [api, filters, page]);
  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select value={filters.state} onChange={(e) => setF('state', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by state">
          <option value="">All states</option>
          {Object.entries(STATE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setF('type', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by type">
          <option value="">All types</option>
          {['welcome', 'resend_confirmation', 'manual', 'bulk', 'invitation'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={filters.recipient} onChange={(e) => setF('recipient', e.target.value)} placeholder="Recipient…" className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by recipient" />
        <input type="date" value={filters.from} onChange={(e) => setF('from', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="From date" />
        <input type="date" value={filters.to} onChange={(e) => setF('to', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="To date" />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <p className="text-[11px] text-text-secondary">
        “Submitted to provider” means Resend accepted the message; it is not proof of delivery. Delivered/bounced states appear once provider feedback is wired in.
      </p>

      <div className="overflow-x-auto rounded-xl border border-light-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-light-soft border-b border-light-border">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Subject</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Recipient</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Type</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Template</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">State</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Provider ref</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-divider">
            {(data?.communications || []).map((c) => (
              <tr key={c.id} className="hover:bg-light-soft cursor-pointer" onClick={() => api.get(`/communications/${c.id}`).then((r) => setSnapshot(r.communication)).catch((e) => setError(e.message))}>
                <td className="px-3 py-2 text-text-primary max-w-[240px] truncate">{c.subject_snapshot}</td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{c.recipient}</td>
                <td className="px-3 py-2 text-text-secondary">{c.communication_type}</td>
                <td className="px-3 py-2 text-text-secondary">{c.template_version_number ? `v${c.template_version_number}` : '—'}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATE_BADGE[c.provider_state] || 'bg-gray-100 text-gray-600'}`}>{STATE_LABELS[c.provider_state] || c.provider_state}</span>
                  {c.error && <span className="block text-[10px] text-red-600 mt-0.5 max-w-[160px] truncate">{c.error}</span>}
                </td>
                <td className="px-3 py-2 text-[11px] text-text-secondary">{c.provider_message_id ? `${String(c.provider_message_id).slice(0, 10)}…` : '—'}{c.retry_count > 0 && ` (+${c.retry_count})`}</td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{fmtDate(c.created_at)}</td>
              </tr>
            ))}
            {data && data.communications.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-text-secondary">No communications match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="flex justify-end gap-1 text-xs">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-button border border-light-border bg-white disabled:opacity-40">Previous</button>
          <button disabled={page >= Math.ceil(data.total / data.pageSize)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-button border border-light-border bg-white disabled:opacity-40">Next</button>
        </div>
      )}

      {snapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSnapshot(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-light-border flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{snapshot.subject_snapshot}</p>
                <p className="text-[11px] text-text-secondary">
                  From {snapshot.sender} · to {snapshot.recipient} · {fmtDate(snapshot.created_at)}
                </p>
              </div>
              <button onClick={() => setSnapshot(null)} className="text-xl text-gray-400 hover:text-gray-600 px-2" aria-label="Close">×</button>
            </div>
            <iframe title="Sent email content" sandbox="" className="flex-1 min-h-[400px] bg-white" srcDoc={snapshot.html_snapshot} />
          </div>
        </div>
      )}
    </div>
  );
}
