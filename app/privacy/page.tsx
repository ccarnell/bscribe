export default function PrivacyPage() {
  return (
    <div className="bg-black text-white min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-emerald-500">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Effective Date: May 26, 2025</p>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">
            Bscribe.ai ("we," "us," "our") values your privacy and is committed to protecting your personal information.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">1. Information We Collect</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Information:</strong> Payments processed securely through Stripe. We do not store credit or debit card information on our servers.</li>
                <li><strong>Contact Information:</strong> We may collect your name, email address, and contact details during purchase transactions for order confirmation and support.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">2. Use of Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and fulfill your orders.</li>
                <li>To communicate with you regarding your orders or to respond to inquiries.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">3. Sharing of Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not sell, rent, or otherwise share your personal information with third parties for marketing purposes.</li>
                <li>We share necessary information with Stripe to process payments securely.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">4. Security</h3>
              <p>We implement industry-standard security measures to protect your data. Despite these measures, we cannot guarantee absolute security.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">5. Cookies</h3>
              <p>Bscribe.ai may use cookies to improve user experience and website functionality. You can set your browser to refuse cookies.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">6. Your Rights</h3>
              <p>You may request access, corrections, or deletion of your personal data by contacting us at support@bscribe.ai.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">7. Updates</h3>
              <p>This Privacy Policy may be updated periodically. Any changes will be posted on this page.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-emerald-500 mb-3">8. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at support@bscribe.ai.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}