import React from 'react';
import LegalPageShell from './LegalPageShell';

/**
 * Impressum (§ 5 DDG, formerly TMG) — REQUIRED for commercial operation in
 * Germany. Owner-review DRAFT: no registration numbers, VAT IDs, court
 * entries, or representative details are invented — every unknown value is an
 * explicit OWNER TO FILL placeholder that must be completed before public
 * launch in Germany.
 */
export default function Impressum() {
  return (
    <LegalPageShell
      title="Impressum"
      updated="July 2026"
      intro="Legal notice per § 5 DDG (Germany). Placeholders marked OWNER TO FILL must be completed before public launch; nothing here is invented."
      sections={[
        {
          heading: 'Anbieter / Service provider',
          list: [
            'Name / legal form: [OWNER TO FILL — e.g. full personal name for a sole proprietorship, or company name + legal form (GmbH/UG) once registered]',
            'Address (ladungsfähige Anschrift, no P.O. box): [OWNER TO FILL — street, number, postal code, city, Germany]',
            'Legal representative (if a company): [OWNER TO FILL — Geschäftsführer name, or remove this line for a sole proprietorship]',
          ],
        },
        {
          heading: 'Kontakt / Contact',
          list: [
            'E-mail: contact@skatalystai.com',
            'Phone: [OWNER TO FILL — a reachable number is expected under § 5 DDG]',
          ],
        },
        {
          heading: 'Register & tax details',
          list: [
            'Commercial register entry (Handelsregister): [OWNER TO FILL — court + HRB number, ONLY if registered; otherwise state "not registered / sole proprietorship"]',
            'VAT ID (USt-IdNr. per § 27a UStG): [OWNER TO FILL — only if one has been issued; otherwise remove this line]',
          ],
        },
        {
          heading: 'Verantwortlich für den Inhalt / Responsible for content',
          body: '[OWNER TO FILL — name and address of the person responsible per § 18 Abs. 2 MStV, typically the owner]',
        },
        {
          heading: 'EU dispute resolution / Verbraucherstreitbeilegung',
          body: 'The European Commission provides an online dispute resolution platform: https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.',
        },
      ]}
    />
  );
}
