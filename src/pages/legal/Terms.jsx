import React from 'react';
import PublicLayout from '../../components/PublicLayout';

export default function Terms() {
  return (
    <PublicLayout>
      <div className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Terms of Service</h1>
          <p className="text-text-secondary mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">1. Acceptance of Terms</h2>
              <p className="text-text-secondary mb-4">
                By accessing or using SkatalystAI ("Service"), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">2. Description of Service</h2>
              <p className="text-text-secondary mb-4">
                SkatalystAI is a data organization and analysis platform that uses artificial
                intelligence to help users structure and understand their unorganized data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">3. User Accounts</h2>
              <p className="text-text-secondary mb-4">
                To use certain features of the Service, you must create an account. You are
                responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account.
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 18 years old to use the Service</li>
                <li>You are responsible for your account security</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">4. Acceptable Use</h2>
              <p className="text-text-secondary mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>Process illegal or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the operation of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">5. Data and Content</h2>
              <p className="text-text-secondary mb-4">
                You retain ownership of all data and content you process through our Service.
                By using the Service, you grant us a limited license to process your data solely
                for the purpose of providing the Service to you.
              </p>
              <p className="text-text-secondary mb-4">
                You are responsible for ensuring you have the right to process any data you
                submit to the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">6. Subscription and Payment</h2>
              <p className="text-text-secondary mb-4">
                Some features of the Service require a paid subscription. By subscribing:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>You agree to pay all applicable fees</li>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>We may change pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">7. Service Availability</h2>
              <p className="text-text-secondary mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted
                access. We may modify, suspend, or discontinue the Service at any time with
                reasonable notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">8. Limitation of Liability</h2>
              <p className="text-text-secondary mb-4">
                To the maximum extent permitted by law, SkatalystAI shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages arising
                from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">9. Indemnification</h2>
              <p className="text-text-secondary mb-4">
                You agree to indemnify and hold harmless SkatalystAI from any claims, damages,
                or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">10. Changes to Terms</h2>
              <p className="text-text-secondary mb-4">
                We may update these Terms from time to time. Continued use of the Service after
                changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">11. Governing Law</h2>
              <p className="text-text-secondary mb-4">
                These Terms shall be governed by and construed in accordance with the laws of
                the jurisdiction in which SkatalystAI is incorporated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">12. Contact</h2>
              <p className="text-text-secondary">
                For questions about these Terms, please contact us at:{' '}
                <a href="mailto:legal@skatalystai.com" className="text-ion hover:opacity-80 transition-opacity">
                  legal@skatalystai.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
