/**
 * Landing Admin — Drafts: saved composer drafts. A draft never sends itself;
 * opening it loads the composer where the admin reviews and sends explicitly.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useAdminApi, fmtDate } from './adminApi';
import Composer from './Composer';

export default function Drafts() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [openDraft, setOpenDraft] = useState(null); // {draft, recipients}
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    api.get(`/drafts?page=${page}&pageSize=25`).then(setData).catch((e) => setError(e.message));
  }, [api, page]);
  useEffect(() => { load(); }, [load]);

  async function open(draftRow) {
    setBusy(draftRow.id);
    try {
      const { draft } = await api.get(`/drafts/${draftRow.id}`);
      // Resolve saved recipient ids to chips (email lookup via lead search).
      const recipients = [];
      for (const id of (draft.recipientLeadIds || []).slice(0, 200)) {
        try {
          const d = await api.get(`/leads/${id}`);
          recipients.push({ id: d.lead.id, email: d.lead.email, name: d.lead.name });
        } catch { /* lead may have been removed */ }
      }
      setOpenDraft({ draft, recipients });
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  async function duplicate(id) {
    try { await api.post(`/drafts/${id}/duplicate`); load(); } catch (e) { setError(e.message); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this draft permanently?')) return;
    try { await api.del(`/drafts/${id}`); load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="rounded-xl border border-light-border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-light-soft border-b border-light-border">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Name</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Subject</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Recipients</th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Updated</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-light-divider">
            {(data?.drafts || []).map((d) => (
              <tr key={d.id} className="hover:bg-light-soft">
                <td className="px-3 py-2 text-text-primary">{d.name}</td>
                <td className="px-3 py-2 text-text-secondary max-w-[240px] truncate">{d.subject || '—'}</td>
                <td className="px-3 py-2 text-text-secondary">{(d.recipientLeadIds || []).length}</td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{fmtDate(d.updatedAt)}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => open(d)} disabled={busy === d.id} className="text-xs text-ion hover:underline mr-3">{busy === d.id ? 'Opening…' : 'Open'}</button>
                  <button onClick={() => duplicate(d.id)} className="text-xs text-text-secondary hover:underline mr-3">Duplicate</button>
                  <button onClick={() => remove(d.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {data && data.drafts.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-text-secondary">No drafts. Save one from the composer.</td></tr>
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

      {openDraft && (
        <Composer
          draft={openDraft.draft}
          recipients={openDraft.recipients}
          onClose={() => { setOpenDraft(null); load(); }}
          onSent={() => load()}
        />
      )}
    </div>
  );
}
