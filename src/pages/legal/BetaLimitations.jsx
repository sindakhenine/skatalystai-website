import React from 'react';
import LegalPageShell from './LegalPageShell';

/** Beta limitations — the single honest list users should read first. */
export default function BetaLimitations() {
  return (
    <LegalPageShell
      title="Beta Limitations"
      updated="July 2026"
      intro="SKatalyst AI is in beta. This page is the honest list of what works, what is limited, and what does not exist yet, so you are never surprised."
      sections={[
        {
          heading: 'Fully working today',
          list: [
            'Sign in with Google/Microsoft/GitHub; private isolated workspace per account.',
            'Local file upload (up to 50 MB per file, 200 files and 500 MB per run) through the full pipeline: scan, understanding, KPI discovery, app generation, independent validation.',
            'Dashboard, CRUD app, chat/RAG (bring your own LLM key), and report generation from YOUR data.',
            'Validated Docker export packages for self-deployment, with documentation.',
            'Team invitations with roles; support system; automated data export; reviewed deletion.',
          ],
        },
        {
          heading: 'Limited (beta scope)',
          list: [
            'Free plan quotas apply (runs, storage, connectors); there are no paid upgrades yet.',
            'SKatalyst Hosting (where enabled): apps auto-stop after a time limit, do not survive maintenance, and are visible only to your workspace, not the public internet.',
            'Hosted previews are short-lived by design.',
            'German and French translations lag behind English.',
          ],
        },
        {
          heading: 'Not available yet, and why (do not plan around these)',
          list: [
            'Cloud connector execution: Preview until each connector can browse, read real file bytes, refresh tokens, handle permissions, and run through the full SKatalyst pipeline with tenant isolation. Connecting and browsing already works.',
            'Managed hosting: not launched until generated apps can be hosted with isolated runtimes, logs, stop/delete, rollback, quotas, and monitoring.',
            'Paid billing: disabled until Stripe live products, webhooks, plan limits, invoices, failure handling, and billing portal are configured and tested. Nothing can charge you today.',
            'Fully automated deletion/export: request-based during beta. Full automation requires safe tenant-scoped export, deletion, anonymization, credential cleanup, and audit retention.',
            'Also planned, not present: custom domains and public app URLs, platform API keys, in-app notifications, uptime SLA, and a status page (use the support page for incidents).',
          ],
        },
        {
          heading: 'Data safety during beta',
          body: 'Beta does not mean casual: tenant isolation, encrypted credentials, append-only audit logs, quotas, and data-rights workflows are fully enforced (see the Security page).',
        },
      ]}
    />
  );
}
