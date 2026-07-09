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
          heading: 'Not available yet (do not plan around these)',
          list: [
            'Cloud connector pipeline execution (Drive/S3/Azure/databases): connect and browse works; running the pipeline from cloud sources is disabled until our verification completes.',
            'Paid plans and billing: disabled; nothing can charge you.',
            'Always-on managed production hosting, custom domains, public app URLs.',
            'Platform API keys, in-app notifications, uptime SLA, status page (planned; use the support page for incidents).',
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
