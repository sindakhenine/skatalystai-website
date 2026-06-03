import React from 'react';
import PublicLayout from '../../components/PublicLayout';

export default function Privacy() {
  return (
    <PublicLayout>
      <div className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
          <p className="text-text-secondary mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">1. Introduction</h2>
              <p className="text-text-secondary mb-4">
                SkatalystAI ("we", "our", or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-medium text-text-primary mb-2">Account Information</h3>
              <p className="text-text-secondary mb-4">
                When you create an account, we collect your name, email address, and any other
                information you provide during registration.
              </p>
              <h3 className="text-lg font-medium text-text-primary mb-2">Usage Data</h3>
              <p className="text-text-secondary mb-4">
                We collect information about how you use our service, including the features you
                use, the time spent on the platform, and your interactions with our interface.
              </p>
              <h3 className="text-lg font-medium text-text-primary mb-2">Data You Process</h3>
              <p className="text-text-secondary mb-4">
                When you use SkatalystAI to process your data, we temporarily access your files
                to perform analysis. We do not permanently store your raw data files.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process your data according to your instructions</li>
                <li>To improve and optimize our platform</li>
                <li>To communicate with you about updates and support</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">4. Data Security</h2>
              <p className="text-text-secondary mb-4">
                We implement appropriate technical and organizational measures to protect your
                data, including encryption in transit and at rest, access controls, and regular
                security assessments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">5. Data Retention</h2>
              <p className="text-text-secondary mb-4">
                We retain your account information for as long as your account is active.
                Processed data and analysis results are retained according to your subscription
                plan settings. You can request deletion of your data at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">6. Your Rights</h2>
              <p className="text-text-secondary mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to rectify inaccurate data</li>
                <li>Right to delete your data</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">7. Third-Party Services</h2>
              <p className="text-text-secondary mb-4">
                We use third-party services for authentication (Google OAuth), hosting, and
                analytics. These services have their own privacy policies governing their use
                of your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">8. Changes to This Policy</h2>
              <p className="text-text-secondary mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">9. Contact Us</h2>
              <p className="text-text-secondary">
                If you have questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@skatalystai.com" className="text-ion hover:opacity-80 transition-opacity">
                  privacy@skatalystai.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
