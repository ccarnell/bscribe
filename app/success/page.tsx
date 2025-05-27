// Create /app/success/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // In a real app, you'd verify the session and get purchase details
    // For now, we'll just show a success message
  }, [sessionId]);

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Congratulations!
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            You've successfully purchased our premium bullsh*t! 
            Your questionable life choices are complete.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">What Happens Next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">1</span>
              </div>
              <p className="text-gray-300">
                <strong>Email Receipt:</strong> Stripe has sent you a receipt. Check your inbox (and spam folder, because life is cruel).
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300">
                <strong>Download Links:</strong> We'll email you the PDF download links within 24 hours. 
                (Okay, fine, it'll probably be in 5 minutes, but we like to under-promise.)
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">3</span>
              </div>
              <p className="text-gray-300">
                <strong>Enjoy Your Purchase:</strong> Read, laugh, question your decisions, and remember - 
                at least you didn't write a business plan for selling AI-generated self-help books.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-900 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-2">Having Second Thoughts?</h3>
          <p className="text-gray-200">
            That's normal. We offer a 30-day money-back guarantee, no questions asked. 
            (Though we might judge you silently.)
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="slim"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-3 rounded-lg"
            onClick={() => window.location.href = '/'}
          >
            Back to More Bad Decisions
          </Button>
          
          <p className="text-gray-400 text-sm">
            Questions? Email us at support@bscribe.ai 
            (We promise to respond with the same level of professionalism you'd expect)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Loading your success...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}