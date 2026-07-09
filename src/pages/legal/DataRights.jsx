import React from 'react';
import LegalPageShell from './LegalPageShell';

/** Data Rights / GDPR page — automated vs manual stated exactly. */
export default function DataRights() {
  return (
    <LegalPageShell
      title="Data Rights (GDPR)"
      updated="July 2026"
      intro="You can get every piece of data SKatalyst stores about your workspace, and you can have it deleted. Here is exactly how, what is automated, and what a human reviews."
      sections={[
        {
          heading: 'Request a data export (automated)',
          body: 'Settings, Data & Privacy, "Request export". The export is generated automatically: a JSON bundle of your workspace records, member list, run history, upload listings, and an audit summary. Credentials and tokens are never included. Download it from the same page for 7 days; after that it is deleted and you can request a fresh one.',
        },
        {
          heading: 'Request deletion (automated execution, human approval)',
          body: 'Settings, Data & Privacy (or the Danger Zone for full account deletion). Your request is recorded instantly; a platform administrator reviews and approves it, then the deletion runs automatically: hosted apps and previews are stopped, uploaded file bytes and generated artifacts are removed, connector credentials are destroyed, your workspace records are deleted, and, for account deletion, your identity is anonymized. Approval is deliberate, not a delay tactic: deletion is irreversible.',
        },
        {
          heading: 'Request correction',
          body: 'Edit your name and avatar in Settings. For anything else (e.g. your account email), contact us and we will correct it.',
        },
        {
          heading: 'Timelines during beta',
          body: 'Exports: typically ready within minutes. Deletions: target 7 days, at most 30 days (the GDPR window). You are contacted at your account email when a deletion completes.',
        },
        {
          heading: 'What is retained after deletion',
          body: 'The append-only audit trail (who did what, when; no file contents) is retained for compliance, and encrypted backups age out on the backup schedule rather than being purged retroactively. Your anonymized account row keeps historical references resolvable without identifying you.',
        },
        {
          heading: 'Contact',
          body: 'contact@skatalystai.com — or file the request in-app, which is faster and tracked.',
        },
      ]}
    />
  );
}
