import React from 'react';
import LegalPageShell from './LegalPageShell';

/** Terms of Service — beta-honest: no paid plans, preview connectors,
 *  beta-scope hosting, user owns their data. */
export default function Terms() {
  return (
    <LegalPageShell
      title="Terms of Service"
      updated="July 2026"
      intro="These terms govern your use of SKatalyst AI while it is in BETA. Short version: it is free, your data stays yours, some features are preview-only, and the service is provided as-is while we build."
      sections={[
        {
          heading: 'Beta status',
          body: 'SKatalyst AI is a beta service. Features may change, be interrupted, or be withdrawn. We aim for reliability but do not offer uptime guarantees or SLAs during the beta.',
        },
        {
          heading: 'Your data and your responsibility',
          body: [
            'You own the data you upload and the outputs generated from it. We claim no rights to your business data.',
            'You are responsible for having the right to upload and process the data you bring, including any personal data of third parties it contains.',
          ],
        },
        {
          heading: 'Generated outputs',
          body: 'Generated applications, dashboards, reports, and export packages are produced automatically from your data and are provided AS-IS. Validate them before relying on them for business decisions; generated application code is scaffolding-level and requires your own hardening before production use.',
        },
        {
          heading: 'No paid plans yet',
          body: 'During the beta all access is free and billing is disabled: nothing can charge you. Paid plans shown on the pricing page are planned and cannot be purchased. If billing launches, it will require your explicit action; no silent conversions.',
        },
        {
          heading: 'Feature scope (honest limits)',
          list: [
            'Cloud connectors (Google Drive, S3, Azure, databases and others) are PREVIEW: you can connect and browse, but pipeline execution from cloud sources is disabled until we complete verification.',
            'SKatalyst Hosting is a beta feature, off by default: hosted apps auto-stop after a time limit, do not survive maintenance restarts, and are visible only to signed-in members of your workspace. It is not always-on production hosting.',
            'The supported production path for generated apps is the validated export package you deploy on your own infrastructure.',
          ],
        },
        {
          heading: 'Acceptable use',
          list: [
            'No illegal content, malware, or data you have no right to process.',
            'No attempts to access other workspaces, probe the platform, or circumvent quotas and rate limits.',
            'No reselling of the beta service.',
          ],
        },
        {
          heading: 'Limitation of liability (draft)',
          body: 'To the extent permitted by law, SKatalyst is not liable for indirect or consequential damages, loss of profits, or loss of data arising from beta use. Nothing in these terms limits liability for intent or gross negligence, or other liability that cannot be excluded under German law.',
        },
        {
          heading: 'Termination',
          body: 'You can stop using the service and request deletion of your workspace at any time (Settings, Data & Privacy). We may suspend accounts that violate acceptable use, with notice where practicable.',
        },
        {
          heading: 'Contact',
          body: 'contact@skatalystai.com',
        },
      ]}
    />
  );
}
