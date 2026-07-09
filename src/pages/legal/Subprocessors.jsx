import React from 'react';
import LegalPageShell from './LegalPageShell';

/** Subprocessors — current vs planned, honestly labeled. */
export default function Subprocessors() {
  return (
    <LegalPageShell
      title="Subprocessors"
      updated="July 2026"
      intro="Third-party providers that process data on our behalf. 'Planned' means the integration exists in the product but is not active for users yet."
      sections={[
        {
          heading: 'Active',
          list: [
            'Google Cloud Platform (Cloud Run, europe-west1, EU): application hosting and logs.',
            'Firebase Hosting (Google): frontend delivery.',
            'Neon (PostgreSQL, EU region): primary database.',
            'Google / Microsoft / GitHub OAuth: sign-in identity (name, email, avatar). Only providers you use.',
            'Resend: transactional email (waitlist/notifications), only when configured.',
          ],
        },
        {
          heading: 'Only if YOU connect them (data flows you initiate)',
          list: [
            'Google Drive, Microsoft OneDrive/SharePoint, Dropbox, Amazon S3, Azure Blob, and databases you connect: we access only the scope you select, currently in read-only preview.',
            'Your own LLM provider (e.g. OpenAI, Anthropic) via bring-your-own-key in generated chat applications: your key, your account, your data flow.',
          ],
        },
        {
          heading: 'Planned (NOT active)',
          list: [
            'Stripe: payment processing, only when paid plans launch. No payment data is collected today.',
            'Error-monitoring provider (e.g. Sentry): under evaluation; structured logs currently stay within Google Cloud.',
          ],
        },
        {
          heading: 'Changes',
          body: 'We update this page before adding a subprocessor that touches customer data.',
        },
      ]}
    />
  );
}
