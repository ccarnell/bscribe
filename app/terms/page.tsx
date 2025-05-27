export default function TermsPage() {
  return (
    <div className="bg-black text-white min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">Terms and Conditions</h1>
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">
            By purchasing and downloading content from Bscribe.ai, you acknowledge and agree to the following:
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">1. Product Nature</h3>
              <p>All products available on Bscribe.ai are digital downloads created strictly for entertainment and satirical purposes only. The content is humorous and fictional and is not intended to be taken seriously.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">2. No Refund Policy</h3>
              <p>All sales are final. Due to the digital nature of our products, Bscribe.ai does not offer refunds or exchanges once the purchase has been completed. "BSCRIBE.AI" will appear on your statement.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">3. Intellectual Property</h3>
              <p>All content purchased on Bscribe.ai is the intellectual property of Cass Joel LLC. You may not redistribute, resell, or use the material for commercial purposes without explicit written consent from Cass Joel LLC. Contact us via email at support@bscribe.ai.com, via phone at (415) 494-7022, and via mail at 8 The Grn Ste B, Dover, Delaware, 19901</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">4. Use at Your Own Risk</h3>
              <p>Bscribe.ai and Cass Joel LLC shall not be liable for any misunderstanding, offense, or dissatisfaction arising from the purchase or use of the satirical content provided.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">5. Payment Processing</h3>
              <p>Payments are securely processed through Stripe. Bscribe.ai does not store your payment details.</p>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-gray-900 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Disclaimer</h2>
            <p>The content provided by Bscribe.ai is solely for humorous and satirical purposes. It is not intended as professional, financial, legal, or personal advice. Cass Joel LLC and Bscribe.ai expressly disclaim responsibility for any actions taken based on the satirical content provided. Users acknowledge that all content is fictional and created purely for entertainment purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}