export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Last updated: January 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          EstrichManager GmbH ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when
          you use our EN13813 compliance management platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
        <p>We collect information you provide directly to us, such as:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Name and contact information</li>
          <li>Company details</li>
          <li>Email address</li>
          <li>Account credentials</li>
          <li>Quality management data related to EN13813 compliance</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
        <p>When you use our platform, we automatically collect:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Usage data and analytics</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We use the collected information for:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Providing and maintaining our services</li>
          <li>Managing your account</li>
          <li>Processing EN13813 compliance documentation</li>
          <li>Improving our platform</li>
          <li>Communicating with you about updates and support</li>
          <li>Complying with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your data.
          Your data is stored securely using industry-standard encryption and security protocols.
        </p>
        <p className="mt-4">
          Our infrastructure providers include:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Supabase (Database and Authentication)</li>
          <li>Vercel (Application Hosting)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your information only in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
          <li>With service providers who assist in our operations</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
        <p>Under GDPR, you have the following rights:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Right to access your personal data</li>
          <li>Right to rectification of inaccurate data</li>
          <li>Right to erasure ("right to be forgotten")</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
          <li>Right to withdraw consent</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to provide our services
          and comply with legal obligations. When data is no longer needed, it will be securely
          deleted or anonymized.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own.
          We ensure appropriate safeguards are in place to protect your data in accordance with
          applicable data protection laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly
          collect personal information from children.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes
          by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or our data practices, please contact us at:
        </p>
        <p className="mt-4">
          EstrichManager GmbH<br />
          Email: privacy@estrichmanager.de<br />
          Data Protection Officer: datenschutz@estrichmanager.de
        </p>
      </div>
    </div>
  )
}