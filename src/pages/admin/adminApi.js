/**
 * Landing Admin API client. Thin wrapper over AuthContext.authFetch, which
 * attaches the Bearer token, refreshes on 401, and NEVER handles provider
 * secrets — all sending happens on the backend.
 */
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const BASE = '/landing-admin';

export function useAdminApi() {
  const { authFetch } = useAuth();

  return useMemo(() => {
    async function request(method, path, body, opts = {}) {
      const res = await authFetch(`${BASE}${path}`, {
        method,
        ...(body !== undefined && !(body instanceof FormData)
          ? { body: JSON.stringify(body) }
          : body !== undefined ? { body } : {}),
        ...opts,
      });
      let data = null;
      try { data = await res.json(); } catch { /* non-JSON (e.g. CSV) handled by caller */ }
      if (!res.ok) {
        const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    }

    return {
      get: (path) => request('GET', path),
      post: (path, body) => request('POST', path, body),
      patch: (path, body) => request('PATCH', path, body),
      del: (path) => request('DELETE', path),
      upload: (path, formData) => request('POST', path, formData),
      /** CSV download via authenticated fetch -> blob -> browser save. */
      async downloadCsv(path, filename) {
        const res = await authFetch(`${BASE}${path}`);
        if (!res.ok) throw new Error(`Export failed (${res.status})`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
    };
  }, [authFetch]);
}

export function toQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const STATE_LABELS = {
  queued: 'Queued',
  submitted: 'Submitted to provider',
  delivered: 'Delivered',
  failed: 'Failed',
  bounced: 'Bounced',
  suppressed: 'Suppressed',
  skipped: 'Skipped (provider off)',
};

export const STATE_BADGE = {
  queued: 'bg-gray-100 text-gray-600',
  submitted: 'bg-teal-50 text-teal-700',
  delivered: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  bounced: 'bg-orange-50 text-orange-700',
  suppressed: 'bg-gray-200 text-gray-600',
  skipped: 'bg-yellow-50 text-yellow-700',
};

export const LEAD_STATUS_LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  qualified: 'Qualified',
  contacted: 'Contacted',
  invited: 'Invited',
  converted: 'Converted',
  not_a_fit: 'Not a fit',
};

export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
