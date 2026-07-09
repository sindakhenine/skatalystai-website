import React from 'react';
import LegalPageShell from './LegalPageShell';

/** Security page — verified claims only, limitations stated. */
export default function Security() {
  return (
    <LegalPageShell
      title="Security"
      updated="July 2026"
      intro="What actually protects your data in SKatalyst, and where the current limits are. Every claim here corresponds to implemented, tested behavior."
      sections={[
        {
          heading: 'Tenant isolation',
          body: 'Every workspace (tenant) is isolated at the database layer: every query is tenant-scoped, roles are enforced server-side (owner/admin/member/viewer, with viewers denied all mutations), and isolation is covered by database-backed tests run against a real PostgreSQL.',
        },
        {
          heading: 'Encrypted secrets, no plaintext credentials',
          body: 'Connector credentials and OAuth tokens are encrypted with AES-256-GCM before storage and are never returned by any API, never included in data exports, and destroyed before workspace deletion. Platform secrets live in the deployment secret store, not in code.',
        },
        {
          heading: 'Bring your own key (BYOK)',
          body: 'Generated chat/RAG applications require your own LLM API key. SKatalyst does not host or proxy LLM inference for your documents by default.',
        },
        {
          heading: 'Audit logging',
          body: 'Security-relevant actions are written to an append-only audit log enforced by a database trigger: not even the application can rewrite history. Data-rights and admin actions are always audited.',
        },
        {
          heading: 'Previews, exports, hosted apps',
          body: 'Hosted previews and beta-hosted apps run as isolated processes with their own database schema, bound to the local interface, reachable only through an authenticated workspace-scoped proxy, and self-destruct on a time limit. Export packages contain your generated app and sanitized sample data (no bulk PII seeding).',
        },
        {
          heading: 'Current limitations (honest)',
          list: [
            'Single-operator team; no 24/7 security response yet.',
            'No external penetration test or SOC 2 / ISO 27001 certification yet.',
            'Generated application code is scaffolding-level; harden it before production use.',
            'Uploaded files are stored unencrypted-at-application-level on encrypted-at-rest cloud storage.',
          ],
        },
        {
          heading: 'Responsible disclosure',
          body: 'Found a vulnerability? Email contact@skatalystai.com with the details. We will acknowledge within 72 hours, will not pursue good-faith researchers, and will credit fixes if you want.',
        },
      ]}
    />
  );
}
