import React from 'react';
import LegalPageShell from './LegalPageShell';

/**
 * Privacy Policy — written to match what the product ACTUALLY does
 * (verified against the codebase; the previous boilerplate falsely claimed
 * "we do not permanently store your raw data files" — uploads DO persist
 * until deleted, and this page now says so).
 */
export default function Privacy() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      updated="July 2026"
      intro="SKatalyst AI ('we', 'us') analyzes business data you choose to upload or connect and generates applications from it. This policy describes exactly what we store, for how long, and how you can get it out or have it removed."
      sections={[
        {
          heading: 'Data we collect and store',
          list: [
            'Account identity: your name, email address, and avatar from the OAuth provider you sign in with (Google, Microsoft, or GitHub). We never see your password.',
            'Uploaded files: files you upload are STORED in your workspace until you delete them, delete the run or project they belong to, or an approved deletion request removes them. They are never shared across workspaces.',
            'Generated outputs: analysis results, dashboards, generated application code, and export packages derived from your data. Export packages expire after 7 days.',
            'Connector tokens: if you connect an external service (e.g. Google Drive, S3), we store the access credentials encrypted (AES-256-GCM). They are destroyed when you disconnect the connector or your workspace is deleted.',
            'Logs and audit events: security- and business-relevant actions (logins, runs, exports, admin actions, data-rights requests) with timestamps and request identifiers. The audit trail is append-only and retained for compliance.',
            'Support and data-rights requests: the content of reports and requests you file in-app.',
            'Billing data: not collected today. If paid plans launch, payment details will be processed by Stripe; we will not store card numbers.',
          ],
        },
        {
          heading: 'What we do NOT do',
          list: [
            'We do not sell your data or use it for advertising.',
            'We do not train machine-learning models on your uploaded content.',
            'We do not read your connected cloud accounts beyond the folders/buckets you explicitly select.',
            'Generated chat/RAG features use YOUR OWN model API key if you provide one (bring your own key); we do not silently run your documents through our own LLM accounts.',
          ],
        },
        {
          heading: 'Retention',
          body: 'Uploads and analysis results stay until you delete them or your deletion request is processed. Generated app packages expire after 7 days. Hosted preview runtimes self-destruct within minutes to hours. Data exports you request are downloadable for 7 days. Audit logs are retained. Backups age out on the backup schedule; deleted data is not purged from backups retroactively.',
        },
        {
          heading: 'Your rights: export, deletion, correction',
          body: [
            'Export: request it in Settings, Data & Privacy. Exports are generated automatically and downloadable for 7 days. They contain your workspace records and file listings, never credentials.',
            'Deletion: request account or workspace deletion in Settings. Deletions are reviewed and executed by our team (deliberately not instant). Uploaded file bytes, generated artifacts, connector credentials, and workspace records are removed; your account identity is anonymized when the account is fully closed. You will be contacted at your account email.',
            'Correction: edit account data in Settings or contact us.',
            'Target processing time during beta: 7 days, at most 30 days.',
          ],
        },
        {
          heading: 'Where data lives and who processes it',
          body: 'Hosting on Google Cloud (europe-west1, EU) and Firebase Hosting; database on Neon (PostgreSQL). The full, current list of subprocessors, including which are only planned, is on our Subprocessors page.',
        },
        {
          heading: 'EU / Germany',
          body: 'SKatalyst is operated from Germany and aims to comply with the GDPR. The legal basis for processing is contract performance (providing the service you signed up for) and legitimate interest (security logging). You may raise complaints with your local data protection authority.',
        },
        {
          heading: 'Contact',
          body: 'contact@skatalystai.com. We answer data-rights mail sent from the address your account is registered under.',
        },
      ]}
    />
  );
}
