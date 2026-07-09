import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageShell from './LegalPageShell';

/** Contact / support page (also covers the "status page" question honestly). */
export default function Contact() {
  return (
    <LegalPageShell
      title="Contact & Support"
      updated="July 2026"
      ownerReview={false}
      intro="Fastest path: signed-in users get tracked support in-app. Everything else lands in the mailbox below."
      sections={[
        {
          heading: 'In-app support (recommended)',
          body: 'Signed in? Use the Support page inside the app to file bugs, questions, or feature requests with your run/build context attached. You can track status and replies there.',
        },
        {
          heading: 'Email',
          body: 'contact@skatalystai.com — beta support is best-effort, typically within 2 business days. Security reports: same address, subject "SECURITY".',
        },
        {
          heading: 'Data rights',
          body: 'Exports and deletions are handled in Settings, Data & Privacy (see the Data Rights page). Email works too if you can no longer sign in.',
        },
        {
          heading: 'Service status',
          body: 'A public status page is planned but does not exist yet. During the beta, incidents are communicated by email to affected users; if something looks down, email us.',
        },
      ]}
    />
  );
}
