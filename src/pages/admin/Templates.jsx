/**
 * Landing Admin — Email Templates: the versioned onboarding email plus
 * reusable admin templates. Versions are immutable once activated or used;
 * editing always happens on a duplicated draft; restore = duplicate an old
 * version. Test sends go only to the admin.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminApi, fmtDate } from './adminApi';
import QuillEditor from './QuillEditor';

const PURPOSES = [
  ['onboarding', 'Onboarding (system)'], ['follow_up', 'Beta request follow-up'],
  ['more_information', 'Request for more information'], ['qualified_response', 'Qualified lead response'],
  ['beta_invitation', 'Beta invitation'], ['waitlist_update', 'Waiting-list update'],
  ['product_update', 'Product update'], ['custom', 'Custom'],
];

export default function Templates() {
  const api = useAdminApi();
  const [templates, setTemplates] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState('');

  const loadList = useCallback(() => {
    api.get('/templates').then((r) => {
      setTemplates(r.templates);
      if (!selectedId && r.templates.length > 0) setSelectedId(r.templates[0].id);
    }).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);
  useEffect(() => { loadList(); }, [loadList]);

  const loadDetail = useCallback(() => {
    if (!selectedId) return;
    api.get(`/templates/${selectedId}`).then(setDetail).catch((e) => setError(e.message));
  }, [api, selectedId]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  async function act(name, fn, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(name); setError(''); setNotice('');
    try { const r = await fn(); loadDetail(); loadList(); return r; } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-4">
      {/* Template list */}
      <div className="space-y-2">
        <button onClick={() => setCreating(true)} className="w-full px-3 py-2 text-sm font-medium text-white bg-slate rounded-button hover:bg-slate-hover">New template</button>
        <ul className="rounded-xl border border-light-border bg-white divide-y divide-light-divider overflow-hidden">
          {(templates || []).map((t) => (
            <li key={t.id}>
              <button onClick={() => setSelectedId(t.id)} className={`w-full text-left px-3 py-2.5 hover:bg-light-soft ${selectedId === t.id ? 'bg-light-soft' : ''}`}>
                <p className="text-sm font-medium text-text-primary">{t.name}</p>
                <p className="text-[11px] text-text-secondary">{PURPOSES.find(([k]) => k === t.purpose)?.[1] || t.purpose} · {t.version_count} version{t.version_count === 1 ? '' : 's'}{t.status === 'archived' ? ' · archived' : ''}</p>
              </button>
            </li>
          ))}
          {templates && templates.length === 0 && <li className="px-3 py-4 text-sm text-text-secondary">No templates yet.</li>}
        </ul>
      </div>

      {/* Detail */}
      <div className="space-y-3">
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{notice}</p>}
        {detail && (
          <TemplateDetail
            detail={detail}
            busy={busy}
            api={api}
            act={act}
            onNotice={setNotice}
          />
        )}
      </div>

      {creating && (
        <CreateTemplateDialog
          api={api}
          onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); loadList(); setSelectedId(id); }}
          onError={setError}
        />
      )}
    </div>
  );
}

function CreateTemplateDialog({ api, onClose, onCreated, onError }) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('follow_up');
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true);
    try {
      const r = await api.post('/templates', { name, purpose, subject: '', htmlBody: '<p></p>' });
      onCreated(r.template.id);
    } catch (e) { onError(e.message); onClose(); }
    finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-light-border p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">New template</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="w-full px-2 py-2 text-sm rounded-lg border border-light-border" aria-label="Template name" />
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-2 py-2 text-sm rounded-lg border border-light-border" aria-label="Purpose">
          {PURPOSES.filter(([k]) => k !== 'onboarding').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-button border border-light-border">Cancel</button>
          <button onClick={create} disabled={!name.trim() || busy} className="px-3 py-1.5 text-sm rounded-button text-white bg-slate disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

function TemplateDetail({ detail, busy, api, act, onNotice }) {
  const { template, versions } = detail;
  const [openVersionId, setOpenVersionId] = useState(null);
  useEffect(() => {
    setOpenVersionId(template.active_version_id || (versions[0] && versions[0].id) || null);
  }, [template.id, template.active_version_id, versions]);
  const version = versions.find((v) => v.id === openVersionId) || null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{template.name}</h2>
          <p className="text-[11px] text-text-secondary">
            {template.purpose} · created {fmtDate(template.created_at)} · {template.created_by ? 'by admin' : 'system seed'}
          </p>
        </div>
        {template.purpose !== 'onboarding' && template.status !== 'archived' && (
          <button onClick={() => act('archive', () => api.post(`/templates/${template.id}/archive`), 'Archive this template?')} className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white">Archive</button>
        )}
      </div>

      {/* Version chips */}
      <div className="flex flex-wrap gap-1.5">
        {versions.map((v) => (
          <button key={v.id} onClick={() => setOpenVersionId(v.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${openVersionId === v.id ? 'border-ion text-ion bg-teal-50' : 'border-light-border text-text-secondary bg-white'}`}>
            v{v.version_number}
            {v.status === 'active' && <span className="ml-1 text-[10px]" style={{ color: '#336600' }}>● active</span>}
            {v.status === 'draft' && <span className="ml-1 text-[10px] text-gray-400">draft</span>}
          </button>
        ))}
      </div>

      {version && (
        <VersionPanel
          key={version.id}
          template={template}
          version={version}
          busy={busy}
          api={api}
          act={act}
          onNotice={onNotice}
        />
      )}
    </div>
  );
}

function VersionPanel({ template, version, busy, api, act, onNotice }) {
  const editable = version.status === 'draft' && !version.used_for_send;
  const [subject, setSubject] = useState(version.subject);
  const [html, setHtml] = useState(version.html_body);
  const [mode, setMode] = useState('preview'); // preview | text | edit
  const [previewMode, setPreviewMode] = useState('desktop');
  const editorRef = useRef(null);

  async function save() {
    await act('save', async () => {
      await api.patch(`/templates/${template.id}/versions/${version.id}`, { subject, htmlBody: html });
      onNotice('Draft version saved.');
    });
  }

  return (
    <div className="rounded-xl border border-light-border bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
        <span>Version {version.version_number}</span>·<span>{version.status}</span>·
        <span>created {fmtDate(version.created_at)}</span>·
        <span>{version.created_by ? 'by admin' : 'system seed'}</span>
        {version.used_for_send && <span className="px-1.5 py-0.5 rounded bg-gray-100">used for sends — immutable</span>}
      </div>

      {/* Subject */}
      {editable && mode === 'edit' ? (
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-2 py-2 text-sm rounded-lg border border-light-border font-medium" aria-label="Subject" />
      ) : (
        <p className="text-sm font-medium text-text-primary">Subject: {version.subject}</p>
      )}

      {/* Mode switch */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => setMode('preview')} className={`px-2 py-1 text-xs rounded ${mode === 'preview' ? 'bg-slate text-white' : 'bg-gray-100'}`}>HTML preview</button>
        <button onClick={() => setMode('text')} className={`px-2 py-1 text-xs rounded ${mode === 'text' ? 'bg-slate text-white' : 'bg-gray-100'}`}>Plain text</button>
        {editable && <button onClick={() => setMode('edit')} className={`px-2 py-1 text-xs rounded ${mode === 'edit' ? 'bg-slate text-white' : 'bg-gray-100'}`}>Edit</button>}
        {mode === 'preview' && (
          <span className="ml-auto flex gap-1">
            <button onClick={() => setPreviewMode('desktop')} className={`px-2 py-1 text-xs rounded ${previewMode === 'desktop' ? 'bg-gray-200' : 'bg-gray-100'}`}>Desktop</button>
            <button onClick={() => setPreviewMode('mobile')} className={`px-2 py-1 text-xs rounded ${previewMode === 'mobile' ? 'bg-gray-200' : 'bg-gray-100'}`}>Mobile</button>
          </span>
        )}
      </div>

      {mode === 'preview' && (
        <div className={`mx-auto border border-light-border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-[375px]' : ''}`}>
          <iframe title={`Template v${version.version_number} preview`} sandbox="" className="w-full h-[380px] bg-white" srcDoc={version.html_body} />
        </div>
      )}
      {mode === 'text' && (
        <pre className="text-xs bg-light-soft rounded-lg p-3 whitespace-pre-wrap max-h-[380px] overflow-y-auto">{version.text_body}</pre>
      )}
      {mode === 'edit' && editable && (
        <QuillEditor ref={editorRef} initialHtml={version.html_body} onChange={(h) => setHtml(h)} />
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {editable && mode === 'edit' && (
          <button onClick={save} disabled={busy === 'save'} className="px-3 py-1.5 text-xs font-medium text-white bg-slate rounded-button disabled:opacity-50">
            {busy === 'save' ? 'Saving…' : 'Save draft version'}
          </button>
        )}
        {version.status !== 'active' && (
          <button
            onClick={() => act('activate', () => api.post(`/templates/${template.id}/versions/${version.id}/activate`), `Activate version ${version.version_number}? ${template.purpose === 'onboarding' ? 'New beta signups will receive THIS content.' : ''}`)}
            className="px-3 py-1.5 text-xs font-medium rounded-button border"
            style={{ borderColor: '#336600', color: '#336600' }}>
            Activate this version
          </button>
        )}
        {version.status === 'active' && (
          <button
            onClick={() => act('deactivate', () => api.post(`/templates/${template.id}/versions/${version.id}/deactivate`), template.purpose === 'onboarding' ? 'Deactivate the onboarding version? New signups will fall back to the built-in copy until another version is activated.' : 'Deactivate this version?')}
            className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white">
            Deactivate
          </button>
        )}
        <button
          onClick={() => act('duplicate', async () => {
            await api.post(`/templates/${template.id}/versions/${version.id}/duplicate`);
            onNotice(`Version ${version.version_number} duplicated into a new draft.`);
          })}
          className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white">
          Duplicate into new draft
        </button>
        <button
          onClick={() => act('test', async () => {
            const r = await api.post('/send/test', { templateVersionId: version.id });
            onNotice(r.sent ? 'Test email submitted — check your admin inbox.' : (r.skipped ? 'Provider not configured; test not sent.' : `Test failed: ${r.error}`));
          })}
          disabled={busy === 'test'}
          className="px-3 py-1.5 text-xs rounded-button border border-light-border bg-white disabled:opacity-50">
          {busy === 'test' ? 'Sending…' : 'Send test to me'}
        </button>
      </div>
    </div>
  );
}
