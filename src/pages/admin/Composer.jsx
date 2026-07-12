/**
 * Composer — Gmail-like email composer for the Landing Admin.
 *
 * Send safety (mirrors the backend contract; the backend re-enforces all of it):
 *  - recipient chips with count; suppressed/unsubscribed leads are excluded
 *    server-side and shown with reasons before sending
 *  - one provider message per recipient (never CC/BCC)
 *  - bulk sends require an explicit confirmation step showing eligible /
 *    excluded counts, subject, sender and reply-to
 *  - an idempotency key generated per confirmation prevents double submission
 *  - unreplaced {{variables}} block the send unless explicitly confirmed
 *  - test sends go only to the admin's own address
 *  - closing with unsaved content asks before discarding
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdminApi } from './adminApi';
import QuillEditor from './QuillEditor';

function uuid() {
  return (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const VARIABLES = ['first_name', 'full_name', 'company', 'role', 'use_case', 'email'];

export default function Composer({
  recipients = [],            // [{id, email, name}]
  draft = null,               // draft object to load
  templateVersion = null,     // {id, subject, html_body} to start from
  invitation = false,         // send as beta invitation
  onClose, onSent,
}) {
  const api = useAdminApi();
  const editorRef = useRef(null);
  const [subject, setSubject] = useState(draft?.subject || templateVersion?.subject || '');
  const [html, setHtml] = useState(draft?.htmlBody || templateVersion?.html_body || '');
  const [chips, setChips] = useState(recipients);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null); // {kind: 'ok'|'err'|'warn', text}
  const [preview, setPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [confirming, setConfirming] = useState(null); // server preview payload
  const [idempotencyKey, setIdempotencyKey] = useState(null);
  const [allowMissing, setAllowMissing] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [draftName, setDraftName] = useState(draft?.name || '');
  const [draftId, setDraftId] = useState(draft?.id || null);
  const sendingRef = useRef(false);

  const leadIds = chips.map((c) => c.id);

  const say = (kind, text) => setNotice({ kind, text });

  const removeChip = (id) => { setChips((c) => c.filter((x) => x.id !== id)); setDirty(true); };

  const onEditorChange = useCallback((newHtml) => { setHtml(newHtml); setDirty(true); }, []);

  // ---- image upload ---------------------------------------------------------
  const [imgFile, setImgFile] = useState(null);
  const [imgAlt, setImgAlt] = useState('');
  const [imgWidth, setImgWidth] = useState(480);

  async function uploadAndInsertImage() {
    if (!imgFile) return;
    setBusy('image');
    try {
      const form = new FormData();
      form.append('image', imgFile);
      const result = await api.upload('/assets', form);
      editorRef.current?.insertImage(result.asset.url, imgAlt.trim(), Number(imgWidth) || undefined);
      setImageDialog(false);
      setImgFile(null); setImgAlt(''); setImgWidth(480);
      setDirty(true);
    } catch (err) {
      say('err', err.status === 503
        ? 'Image uploads are not available yet (storage bucket not configured). You can still send plain emails.'
        : err.message);
    } finally { setBusy(''); }
  }

  // ---- drafts ----------------------------------------------------------------
  async function saveDraft() {
    setBusy('draft');
    try {
      const result = await api.post('/drafts', {
        id: draftId || undefined,
        name: draftName || subject || 'Untitled draft',
        subject,
        htmlBody: html,
        templateVersionId: templateVersion?.id || draft?.templateVersionId || undefined,
        recipientLeadIds: leadIds,
      });
      setDraftId(result.draft.id);
      setDraftName(result.draft.name);
      setDirty(false);
      say('ok', 'Draft saved.');
    } catch (err) { say('err', err.message); }
    finally { setBusy(''); }
  }

  // ---- test send ---------------------------------------------------------------
  async function sendTest() {
    setBusy('test');
    try {
      const result = await api.post('/send/test', { subject, htmlBody: html });
      if (result.sent) say('ok', 'Test email submitted to the provider — check your admin inbox.');
      else if (result.skipped) say('warn', 'Email provider is not configured; the test was not sent.');
      else say('err', `Test send failed: ${result.error || 'unknown error'}`);
    } catch (err) { say('err', err.message); }
    finally { setBusy(''); }
  }

  // ---- send flow: server preview -> explicit confirm -> send -------------------
  async function beginSend() {
    if (!subject.trim()) return say('err', 'Subject is required.');
    if (!html || !html.replace(/<[^>]+>/g, '').trim()) return say('err', 'The email body is empty.');
    if (leadIds.length === 0) return say('err', 'Add at least one recipient.');
    setBusy('preview');
    try {
      const p = await api.post('/send/preview', { leadIds, subject, htmlBody: html });
      setConfirming(p);
      setIdempotencyKey(uuid());
      setAllowMissing(false);
    } catch (err) { say('err', err.message); }
    finally { setBusy(''); }
  }

  async function confirmSend() {
    if (sendingRef.current) return; // double-click guard (idempotency covers retries)
    sendingRef.current = true;
    setBusy('send');
    try {
      const result = await api.post('/send', {
        leadIds, subject, htmlBody: html,
        type: invitation ? 'invitation' : 'manual',
        idempotencyKey,
        allowMissingVariables: allowMissing,
      });
      setConfirming(null);
      setDirty(false);
      say('ok', `Done: ${result.summary.submitted} submitted to provider, ${result.summary.failed} failed, ${result.summary.suppressed} suppressed.`);
      if (onSent) onSent(result);
    } catch (err) {
      if (err.data?.error === 'MISSING_VARIABLES') {
        say('warn', `Missing variable values for ${err.data.blocked.length} recipient(s): ${err.data.blocked.map((b) => b.email).join(', ')}. Fill the lead fields or tick "send with blanks".`);
        setAllowMissing(false);
      } else {
        say('err', err.message);
      }
    } finally { sendingRef.current = false; setBusy(''); }
  }

  function requestClose() {
    if (dirty && !window.confirm('Discard unsaved changes? Save as draft first if you want to keep them.')) return;
    onClose();
  }

  // Insert a {{variable}} at the end of the subject via button row.
  function addVariableToSubject(v) {
    setSubject((s) => `${s}{{${v}}}`);
    setDirty(true);
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !confirming && !imageDialog) requestClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, confirming, imageDialog]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6" role="dialog" aria-modal="true" aria-label="Email composer">
      <div className="w-full sm:max-w-3xl max-h-[95vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-light-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2F3A44]">
          <h2 className="text-sm font-semibold text-white">
            {invitation ? 'Send beta invitation' : 'New email'}
            <span className="ml-2 text-white/60 font-normal">{chips.length} recipient{chips.length === 1 ? '' : 's'}</span>
          </h2>
          <button onClick={requestClose} className="text-white/70 hover:text-white text-xl leading-none px-2" aria-label="Close composer">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Recipients */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-light-divider pb-2">
            <span className="text-xs font-medium text-text-secondary w-10">To</span>
            {chips.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-light-soft border border-light-border text-xs text-text-primary">
                {c.name ? `${c.name} <${c.email}>` : c.email}
                <button onClick={() => removeChip(c.id)} className="w-4 h-4 rounded-full hover:bg-gray-200 text-gray-500" aria-label={`Remove ${c.email}`}>×</button>
              </span>
            ))}
            {chips.length === 0 && <span className="text-xs text-text-secondary italic">Select leads from the Leads table</span>}
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2 border-b border-light-divider pb-2">
            <span className="text-xs font-medium text-text-secondary w-10">Subject</span>
            <input
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setDirty(true); }}
              className="flex-1 text-sm px-2 py-1.5 focus:outline-none"
              placeholder="Subject"
              aria-label="Subject"
            />
          </div>

          {/* Variables helper */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] text-text-secondary mr-1">Variables:</span>
            {VARIABLES.map((v) => (
              <button key={v} onClick={() => addVariableToSubject(v)}
                className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-gray-100 hover:bg-gray-200 text-gray-700"
                title={`Append {{${v}}} to the subject (type it anywhere in the body)`}>
                {`{{${v}}}`}
              </button>
            ))}
          </div>

          {/* Editor / preview */}
          {preview ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setPreviewMode('desktop')} className={`px-2 py-1 text-xs rounded ${previewMode === 'desktop' ? 'bg-slate text-white' : 'bg-gray-100 text-gray-700'}`}>Desktop</button>
                <button onClick={() => setPreviewMode('mobile')} className={`px-2 py-1 text-xs rounded ${previewMode === 'mobile' ? 'bg-slate text-white' : 'bg-gray-100 text-gray-700'}`}>Mobile</button>
              </div>
              <div className={`mx-auto border border-light-border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-[375px]' : ''}`}>
                <iframe
                  title="Email preview"
                  sandbox=""
                  className="w-full h-[340px] bg-white"
                  srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${html}</body></html>`}
                />
              </div>
            </div>
          ) : (
            <QuillEditor
              ref={editorRef}
              initialHtml={html}
              onChange={onEditorChange}
              onRequestImage={() => setImageDialog(true)}
            />
          )}

          {/* Signature hint */}
          <p className="text-[11px] text-text-secondary">
            Sent from SKatalyst AI · replies go to the founder address. A plain-text version is generated automatically.
          </p>

          {notice && (
            <p role="alert" className={`text-xs rounded-lg px-3 py-2 ${notice.kind === 'ok' ? 'bg-green-50 text-green-700' : notice.kind === 'warn' ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-700'}`}>
              {notice.text}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-light-border bg-light-soft">
          <button onClick={beginSend} disabled={!!busy}
            className="px-5 py-2 text-sm font-medium text-white bg-slate rounded-button hover:bg-slate-hover disabled:opacity-50">
            {busy === 'preview' ? 'Checking…' : 'Send'}
          </button>
          <button onClick={() => setPreview((p) => !p)} className="px-3 py-2 text-sm rounded-button border border-light-border bg-white hover:bg-gray-50">
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={sendTest} disabled={!!busy} className="px-3 py-2 text-sm rounded-button border border-light-border bg-white hover:bg-gray-50 disabled:opacity-50">
            {busy === 'test' ? 'Sending…' : 'Send test to me'}
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Draft name"
              className="w-32 px-2 py-1.5 text-xs rounded border border-light-border"
              aria-label="Draft name"
            />
            <button onClick={saveDraft} disabled={!!busy} className="px-3 py-2 text-sm rounded-button border border-light-border bg-white hover:bg-gray-50 disabled:opacity-50">
              {busy === 'draft' ? 'Saving…' : (draftId ? 'Update draft' : 'Save draft')}
            </button>
          </div>
        </div>
      </div>

      {/* Image dialog */}
      {imageDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Insert image">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-light-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Insert image</h3>
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(e) => setImgFile(e.target.files?.[0] || null)}
              className="block w-full text-xs" aria-label="Choose image file" />
            <p className="text-[11px] text-text-secondary">PNG, JPEG, GIF or WebP · max 2 MB. SVG and HTML files are rejected.</p>
            <label className="block text-xs text-text-secondary">
              Alt text (for accessibility and clients that block images)
              <input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm rounded border border-light-border" />
            </label>
            <label className="block text-xs text-text-secondary">
              Display width (px)
              <input type="number" min="80" max="640" value={imgWidth}
                onChange={(e) => setImgWidth(e.target.value)}
                className="mt-1 w-24 px-2 py-1.5 text-sm rounded border border-light-border" />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setImageDialog(false); setImgFile(null); }} className="px-3 py-1.5 text-sm rounded-button border border-light-border">Cancel</button>
              <button onClick={uploadAndInsertImage} disabled={!imgFile || busy === 'image'}
                className="px-3 py-1.5 text-sm rounded-button text-white bg-slate hover:bg-slate-hover disabled:opacity-50">
                {busy === 'image' ? 'Uploading…' : 'Upload & insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk-send confirmation */}
      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Confirm send">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-light-border p-5 space-y-3">
            <h3 className="text-base font-semibold text-text-primary">Confirm send</h3>
            <div className="text-sm text-text-secondary space-y-1">
              <p><span className="font-medium text-text-primary">{confirming.eligibleCount}</span> of {confirming.selected} selected recipient(s) are eligible.</p>
              {confirming.excludedCount > 0 && (
                <div className="text-xs bg-yellow-50 text-yellow-800 rounded-lg p-2">
                  <p className="font-medium mb-1">{confirming.excludedCount} excluded:</p>
                  <ul className="space-y-0.5">
                    {confirming.excluded.slice(0, 8).map((e) => (
                      <li key={e.id}>{e.email} — {e.reason.replace(/_/g, ' ')}</li>
                    ))}
                    {confirming.excluded.length > 8 && <li>…and {confirming.excluded.length - 8} more</li>}
                  </ul>
                </div>
              )}
              {confirming.recipientsWithMissingVariables?.length > 0 && (
                <div className="text-xs bg-orange-50 text-orange-800 rounded-lg p-2">
                  <p className="font-medium">{confirming.recipientsWithMissingVariables.length} recipient(s) missing variable values:</p>
                  <ul className="space-y-0.5 mt-1">
                    {confirming.recipientsWithMissingVariables.slice(0, 5).map((r) => (
                      <li key={r.leadId}>{r.email}: {r.missingVariables.join(', ')}</li>
                    ))}
                  </ul>
                  <label className="flex items-center gap-2 mt-2 font-medium">
                    <input type="checkbox" checked={allowMissing} onChange={(e) => setAllowMissing(e.target.checked)} />
                    Send anyway with blank values
                  </label>
                </div>
              )}
              <p className="pt-1">Subject: <span className="text-text-primary">{subject}</span></p>
              <p>From: <span className="text-text-primary">{confirming.sender}</span></p>
              <p>Reply-To: <span className="text-text-primary">{confirming.replyTo}</span></p>
              <p className="text-[11px]">Each recipient receives an individual email. Recipients never see each other.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirming(null)} className="px-3 py-2 text-sm rounded-button border border-light-border">Cancel</button>
              <button
                onClick={confirmSend}
                disabled={busy === 'send' || confirming.eligibleCount === 0 || (confirming.recipientsWithMissingVariables?.length > 0 && !allowMissing)}
                className="px-4 py-2 text-sm font-medium rounded-button text-white bg-slate hover:bg-slate-hover disabled:opacity-50">
                {busy === 'send' ? 'Sending…' : `Send to ${confirming.eligibleCount} recipient${confirming.eligibleCount === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
