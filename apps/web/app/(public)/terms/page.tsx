export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Effective Date: January 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using the EstrichManager platform, you accept and agree to be bound by
          these Terms of Service and our Privacy Policy. If you do not agree to these terms,
          please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          EstrichManager is a Software-as-a-Service (SaaS) platform for quality management in the
          floor screed industry, specifically designed for EN13813 compliance management. The service
          includes tools for recipe management, batch processing, testing, documentation, and
          compliance reporting.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Beta Phase</h2>
        <p>
          The EstrichManager platform is currently in beta phase. During this period:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>The service is provided free of charge</li>
          <li>Features may be added, modified, or removed without notice</li>
          <li>Service availability is not guaranteed</li>
          <li>We may introduce pricing plans after the beta phase ends</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Accounts</h2>
        <p>To use our services, you must:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Register for an account with accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Promptly notify us of any unauthorized access</li>
          <li>Be responsible for all activities under your account</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Use the service for any illegal or unauthorized purpose</li>
          <li>Violate any laws in your jurisdiction</li>
          <li>Transmit any malicious code or viruses</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use the service to infringe on intellectual property rights</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data and Content</h2>
        <p>
          You retain all rights to your data. By using our service, you grant us a limited license
          to process your data solely for the purpose of providing the service. We will handle your
          data in accordance with our Privacy Policy and applicable data protection laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
        <p>
          The EstrichManager platform, including all content, features, and functionality, is owned
          by EstrichManager GmbH and is protected by international copyright, trademark, and other
          intellectual property laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED. WE SPECIFICALLY DISCLAIM ALL WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="mt-4">
          While our platform assists with EN13813 compliance management, you remain solely
          responsible for ensuring your actual compliance with all applicable standards and
          regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESTRICHMANAGER GMBH SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless EstrichManager GmbH from any claims,
          damages, losses, liabilities, and expenses arising from your use of the service
          or violation of these terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account at any time, with or
          without cause or notice. Upon termination, your right to use the service will
          immediately cease.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
        <p>
          We may modify these Terms of Service at any time. We will notify users of any
          material changes via email or through the platform. Continued use of the service
          after changes constitutes acceptance of the modified terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
        <p>
          These Terms of Service are governed by the laws of Germany. Any disputes shall
          be subject to the exclusive jurisdiction of the courts in Berlin, Germany.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Severability</h2>
        <p>
          If any provision of these terms is found to be unenforceable, the remaining
          provisions will continue in full force and effect.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact Information</h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <p className="mt-4">
          EstrichManager GmbH<br />
          Email: legal@estrichmanager.de<br />
          Support: support@estrichmanager.de
        </p>
      </div>
    </div>
  )
}