/**
 * Landing Admin — Leads: server-side paginated table with search, filters,
 * sorting, selection (single / page / clear), CSV export of the filtered
 * set, and the lead detail drawer with notes, status, communications,
 * suppression, resend-confirmation, invitation and compose actions.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAdminApi, toQuery, fmtDate, LEAD_STATUS_LABELS, STATE_LABELS, STATE_BADGE } from './adminApi';
import Composer from './Composer';

const PAGE_SIZE = 25;

function StatusBadge({ status }) {
  const colors = {
    new: 'bg-teal-50 text-teal-700', reviewing: 'bg-blue-50 text-blue-700',
    qualified: 'bg-indigo-50 text-indigo-700', contacted: 'bg-sky-50 text-sky-700',
    invited: 'bg-purple-50 text-purple-700', converted: 'bg-green-50 text-green-700',
    not_a_fit: 'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{LEAD_STATUS_LABELS[status] || status}</span>;
}

function SubBadge({ sub }) {
  if (sub === 'subscribed') return null;
  return <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">{sub}</span>;
}

export default function Leads({ initialLeadId, onLeadClosed, bulkEmailEnabled = false }) {
  const api = useAdminApi();
  const [filters, setFilters] = useState({ search: '', leadStatus: '', subscription: '', emailState: '', invitation: '', conversion: '', createdFrom: '', createdTo: '' });
  const [sort, setSort] = useState({ by: 'created_at', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState({}); // id -> {id,email,name}
  const [detailId, setDetailId] = useState(initialLeadId || null);
  const [composer, setComposer] = useState(null); // {recipients, invitation}
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const q = toQuery({ ...filters, page, pageSize: PAGE_SIZE, sortBy: sort.by, sortDir: sort.dir });
      setData(await api.get(`/leads${q}`));
    } catch (e) { setError(e.message); }
  }, [api, filters, page, sort]);

  useEffect(() => { load(); }, [load]);

  const selectedList = Object.values(selected);
  const pageAllSelected = data?.leads?.length > 0 && data.leads.every((l) => selected[l.id]);

  function toggleOne(lead) {
    setSelected((s) => {
      const next = { ...s };
      if (next[lead.id]) delete next[lead.id];
      else next[lead.id] = { id: lead.id, email: lead.email, name: lead.name };
      return next;
    });
  }
  function togglePage() {
    setSelected((s) => {
      const next = { ...s };
      if (pageAllSelected) data.leads.forEach((l) => delete next[l.id]);
      else data.leads.forEach((l) => { next[l.id] = { id: l.id, email: l.email, name: l.name }; });
      return next;
    });
  }

  function setFilter(key, value) { setFilters((f) => ({ ...f, [key]: value })); setPage(1); }

  function sortBy(col) {
    setSort((s) => ({ by: col, dir: s.by === col && s.dir === 'desc' ? 'asc' : 'desc' }));
  }

  async function exportCsv() {
    try {
      await api.downloadCsv(`/leads/export.csv${toQuery(filters)}`, `skatalyst-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) { setError(e.message); }
  }

  const th = (label, col) => (
    <th className="px-3 py-2 text-left font-medium text-text-secondary whitespace-nowrap">
      {col ? (
        <button onClick={() => sortBy(col)} className="inline-flex items-center gap-1 hover:text-text-primary">
          {label}{sort.by === col && <span aria-hidden>{sort.dir === 'desc' ? '↓' : '↑'}</span>}
        </button>
      ) : label}
    </th>
  );

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search name, email, company, use case…"
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg border border-light-border bg-white focus:outline-none focus:ring-2 focus:ring-ion"
          aria-label="Search leads"
        />
        <select value={filters.leadStatus} onChange={(e) => setFilter('leadStatus', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.subscription} onChange={(e) => setFilter('subscription', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by subscription">
          <option value="">All subscriptions</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="suppressed">Suppressed</option>
        </select>
        <select value={filters.emailState} onChange={(e) => setFilter('emailState', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by confirmation email">
          <option value="">Confirmation: any</option>
          <option value="sent">Confirmation sent</option>
          <option value="not_sent">Confirmation not sent</option>
        </select>
        <select value={filters.invitation} onChange={(e) => setFilter('invitation', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by invitation">
          <option value="">Invitation: any</option>
          <option value="invited">Invited</option>
          <option value="not_invited">Not invited</option>
        </select>
        <select value={filters.conversion} onChange={(e) => setFilter('conversion', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Filter by conversion">
          <option value="">Conversion: any</option>
          <option value="converted">Converted</option>
          <option value="not_converted">Not converted</option>
        </select>
        <input type="date" value={filters.createdFrom} onChange={(e) => setFilter('createdFrom', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Signed up from" />
        <input type="date" value={filters.createdTo} onChange={(e) => setFilter('createdTo', e.target.value)} className="px-2 py-2 text-sm rounded-lg border border-light-border bg-white" aria-label="Signed up until" />
      </div>

      {/* Selection / actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-secondary">{selectedList.length} selected</span>
        {selectedList.length > 0 && (
          <>
            <button onClick={() => setComposer({ recipients: selectedList, invitation: false })} className="px-3 py-1.5 text-xs font-medium text-white bg-slate rounded-button hover:bg-slate-hover">Compose email</button>
            <button onClick={() => setSelected({})} className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white">Clear selection</button>
            {selectedList.length > 1 && !bulkEmailEnabled && (
              <span data-testid="bulk-disabled-hint" className="text-[11px] px-2 py-1 rounded bg-yellow-50 text-yellow-800">
                Bulk email is currently disabled (release gate) — you can send to one lead at a time.
              </span>
            )}
          </>
        )}
        <button onClick={exportCsv} className="ml-auto px-3 py-1.5 text-xs rounded-button border border-light-border bg-white hover:bg-gray-50">Export filtered CSV</button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-light-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-light-soft border-b border-light-border">
            <tr>
              <th className="px-3 py-2">
                <input type="checkbox" checked={pageAllSelected || false} onChange={togglePage} aria-label="Select visible page" />
              </th>
              {th('Name', 'name')}
              {th('Email', 'email')}
              {th('Company', 'company')}
              {th('Use case')}
              {th('Signup', 'created_at')}
              {th('Status', 'lead_status')}
              {th('Confirmation')}
              {th('Last contact', 'last_contacted_at')}
              {th('Invited')}
              {th('Converted')}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-divider">
            {(data?.leads || []).map((lead) => (
              <tr key={lead.id} className="hover:bg-light-soft cursor-pointer" onClick={() => setDetailId(lead.id)}>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={!!selected[lead.id]} onChange={() => toggleOne(lead)} aria-label={`Select ${lead.email}`} />
                </td>
                <td className="px-3 py-2 text-text-primary whitespace-nowrap">{lead.name || '—'}</td>
                <td className="px-3 py-2 text-text-primary whitespace-nowrap">{lead.email}<SubBadge sub={lead.subscription} /></td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{lead.company || '—'}</td>
                <td className="px-3 py-2 text-text-secondary max-w-[180px] truncate">{lead.useCase || '—'}</td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{fmtDate(lead.createdAt)}</td>
                <td className="px-3 py-2"><StatusBadge status={lead.leadStatus} /></td>
                <td className="px-3 py-2 text-xs">{lead.welcomeEmailSent ? <span className="text-green-700">sent</span> : <span className="text-gray-500">not sent</span>}</td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{fmtDate(lead.lastContactedAt)}</td>
                <td className="px-3 py-2 text-xs">{lead.invitedAt ? 'yes' : '—'}</td>
                <td className="px-3 py-2 text-xs">{lead.converted ? <span className="font-medium" style={{ color: '#336600' }}>yes</span> : '—'}</td>
              </tr>
            ))}
            {data && data.leads.length === 0 && (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-sm text-text-secondary">No leads match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{data.total} lead{data.total === 1 ? '' : 's'} · page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-button border border-light-border bg-white disabled:opacity-40">Previous</button>
            <button disabled={page >= Math.ceil(data.total / data.pageSize)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-button border border-light-border bg-white disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {detailId && (
        <LeadDetail
          leadId={detailId}
          onClose={() => { setDetailId(null); if (onLeadClosed) onLeadClosed(); load(); }}
          onCompose={(lead, invitation) => setComposer({ recipients: [{ id: lead.id, email: lead.email, name: lead.name }], invitation })}
        />
      )}

      {composer && (
        <Composer
          recipients={composer.recipients}
          invitation={composer.invitation}
          bulkEmailEnabled={bulkEmailEnabled}
          onClose={() => setComposer(null)}
          onSent={() => load()}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Lead detail drawer
 * ------------------------------------------------------------------------- */

function LeadDetail({ leadId, onClose, onCompose }) {
  const api = useAdminApi();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [edit, setEdit] = useState(null); // {name, company, role, useCase}
  const [snapshot, setSnapshot] = useState(null); // communication content view

  const load = useCallback(() => {
    api.get(`/leads/${leadId}`).then(setDetail).catch((e) => setError(e.message));
  }, [api, leadId]);
  useEffect(() => { load(); }, [load]);

  async function act(name, fn, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(name); setError('');
    try { await fn(); load(); } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  if (!detail && !error) return null;
  const lead = detail?.lead;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div className="w-full sm:max-w-xl h-full bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Lead detail">
        <div className="sticky top-0 bg-[#2F3A44] px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold text-white truncate">{lead?.name || lead?.email || 'Lead'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl px-2" aria-label="Close">×</button>
        </div>

        {error && <p role="alert" className="m-4 text-sm text-red-600">{error}</p>}

        {lead && (
          <div className="p-4 space-y-5">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onCompose(lead, false)} className="px-3 py-1.5 text-xs font-medium text-white bg-slate rounded-button hover:bg-slate-hover">Compose email</button>
              <button onClick={() => onCompose(lead, true)} className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white hover:bg-gray-50">Send beta invitation</button>
              <button
                disabled={busy === 'resend'}
                onClick={() => act('resend', () => api.post(`/leads/${lead.id}/resend-confirmation`, { idempotencyKey: `${lead.id}-resend-${Date.now()}` }), 'Resend the onboarding confirmation email to this lead?')}
                className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white hover:bg-gray-50 disabled:opacity-50">
                {busy === 'resend' ? 'Sending…' : 'Resend confirmation'}
              </button>
              {lead.subscription !== 'suppressed' ? (
                <button onClick={() => act('suppress', () => api.post(`/leads/${lead.id}/suppress`), 'Suppress ALL communication to this lead?')} className="px-3 py-1.5 text-xs rounded-button border border-red-200 text-red-700 bg-white hover:bg-red-50">Suppress</button>
              ) : (
                <button onClick={() => act('unsuppress', () => api.post(`/leads/${lead.id}/unsuppress`), 'Remove suppression for this lead? They will become emailable again.')} className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white hover:bg-gray-50">Remove suppression</button>
              )}
            </div>

            {/* Signup info + editable enrichment */}
            <section className="rounded-xl border border-light-border p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Lead record</h3>
                {!edit ? (
                  <button onClick={() => setEdit({ name: lead.name || '', company: lead.company || '', role: lead.role || '', useCase: lead.useCase || '' })} className="text-xs text-ion hover:underline">Edit fields</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEdit(null)} className="text-xs text-text-secondary">Cancel</button>
                    <button onClick={() => act('save', async () => { await api.patch(`/leads/${lead.id}`, edit); setEdit(null); })} className="text-xs text-ion font-medium">Save</button>
                  </div>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-text-secondary">Email</dt><dd className="text-text-primary">{lead.email}</dd>
                <dt className="text-text-secondary">Name</dt>
                <dd>{edit ? <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="w-full px-1.5 py-0.5 text-sm border border-light-border rounded" /> : (lead.name || '—')}</dd>
                <dt className="text-text-secondary">Company</dt>
                <dd>{edit ? <input value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} className="w-full px-1.5 py-0.5 text-sm border border-light-border rounded" /> : (lead.company || '—')}</dd>
                <dt className="text-text-secondary">Role</dt>
                <dd>{edit ? <input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} className="w-full px-1.5 py-0.5 text-sm border border-light-border rounded" /> : (lead.role || '—')}</dd>
                <dt className="text-text-secondary">Use case</dt>
                <dd>{edit ? <input value={edit.useCase} onChange={(e) => setEdit({ ...edit, useCase: e.target.value })} className="w-full px-1.5 py-0.5 text-sm border border-light-border rounded" /> : (lead.useCase || '—')}</dd>
                <dt className="text-text-secondary">Source</dt><dd>{lead.source || '—'}</dd>
                <dt className="text-text-secondary">Locale</dt><dd>{lead.locale || '—'}</dd>
                <dt className="text-text-secondary">Signed up</dt><dd>{fmtDate(lead.createdAt)}</dd>
                <dt className="text-text-secondary">Consent</dt>
                <dd className="text-xs text-text-secondary">Beta-list signup via public form (explicit consent checkbox ships in the next form update)</dd>
                <dt className="text-text-secondary">Subscription</dt><dd>{lead.subscription}</dd>
                <dt className="text-text-secondary">Confirmation email</dt>
                <dd>{lead.welcomeEmailSent ? `sent ${fmtDate(lead.welcomeEmailSentAt)}` : 'not sent'}</dd>
                <dt className="text-text-secondary">Invited</dt><dd>{lead.invitedAt ? fmtDate(lead.invitedAt) : '—'}</dd>
                <dt className="text-text-secondary">Converted</dt>
                <dd>{lead.converted ? <span style={{ color: '#336600' }}>yes · user {String(lead.convertedUserId).slice(0, 8)}… · {fmtDate(lead.convertedAt)}</span> : 'not yet'}</dd>
              </dl>
            </section>

            {/* Status */}
            <section className="rounded-xl border border-light-border p-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={lead.leadStatus} />
                <select
                  value={lead.leadStatus}
                  onChange={(e) => act('status', () => api.post(`/leads/${lead.id}/status`, { status: e.target.value }))}
                  className="px-2 py-1.5 text-sm rounded-lg border border-light-border bg-white"
                  aria-label="Change lead status"
                >
                  {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {detail.statusHistory.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                  {detail.statusHistory.slice(0, 6).map((h) => (
                    <li key={h.id}>{fmtDate(h.changed_at)}: {h.previous_status || '—'} → {h.new_status}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Notes */}
            <section className="rounded-xl border border-light-border p-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Internal notes</h3>
              <div className="flex gap-2 mb-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-light-border" aria-label="New note" />
                <button
                  disabled={!note.trim() || busy === 'note'}
                  onClick={() => act('note', async () => { await api.post(`/leads/${lead.id}/notes`, { note }); setNote(''); })}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate rounded-button disabled:opacity-50">Add</button>
              </div>
              <ul className="space-y-2">
                {detail.notes.map((n) => (
                  <li key={n.id} className="text-sm bg-light-soft rounded-lg p-2">
                    <p className="text-text-primary whitespace-pre-wrap">{n.note}</p>
                    <p className="text-[11px] text-text-secondary mt-1">{fmtDate(n.created_at)}</p>
                  </li>
                ))}
                {detail.notes.length === 0 && <li className="text-xs text-text-secondary">No notes yet.</li>}
              </ul>
            </section>

            {/* Communication history */}
            <section className="rounded-xl border border-light-border p-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">Communication history</h3>
              <ul className="space-y-2">
                {detail.communications.map((c) => (
                  <li key={c.id} className="text-sm border border-light-divider rounded-lg p-2">
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => api.get(`/communications/${c.id}`).then((r) => setSnapshot(r.communication)).catch((e) => setError(e.message))} className="text-left text-text-primary hover:text-ion truncate">
                        {c.subject_snapshot}
                      </button>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATE_BADGE[c.provider_state] || 'bg-gray-100 text-gray-600'}`}>
                        {STATE_LABELS[c.provider_state] || c.provider_state}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {c.communication_type}{c.template_version_number ? ` · template v${c.template_version_number}` : ''} · {fmtDate(c.created_at)}
                      {c.provider_message_id ? ` · ref ${String(c.provider_message_id).slice(0, 12)}…` : ''}
                      {c.retry_count > 0 ? ` · ${c.retry_count} retr${c.retry_count === 1 ? 'y' : 'ies'}` : ''}
                    </p>
                    {c.error && <p className="text-[11px] text-red-600 mt-0.5">{c.error}</p>}
                    {c.provider_state === 'failed' && (
                      <button onClick={() => act('retry', () => api.post(`/communications/${c.id}/retry`))} className="mt-1 text-[11px] text-ion hover:underline">Retry send</button>
                    )}
                  </li>
                ))}
                {detail.communications.length === 0 && <li className="text-xs text-text-secondary">No emails sent to this lead yet.</li>}
              </ul>
            </section>
          </div>
        )}

        {/* Exact content snapshot viewer */}
        {snapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSnapshot(null)}>
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-light-border flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{snapshot.subject_snapshot}</p>
                  <p className="text-[11px] text-text-secondary">
                    From {snapshot.sender} · Reply-To {snapshot.reply_to || '—'} · to {snapshot.recipient} · {fmtDate(snapshot.created_at)}
                    {snapshot.template_version_number ? ` · template v${snapshot.template_version_number}` : ''}
                  </p>
                </div>
                <button onClick={() => setSnapshot(null)} className="text-xl text-gray-400 hover:text-gray-600 px-2" aria-label="Close snapshot">×</button>
              </div>
              <iframe title="Sent email content" sandbox="" className="flex-1 min-h-[400px] bg-white" srcDoc={snapshot.html_snapshot} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
