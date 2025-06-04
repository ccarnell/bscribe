'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [downloadData, setDownloadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    if (sessionId) {
      // Fetch download link
      fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDownloadData(data);
          } else {
            setError(data.error || 'Failed to load download');
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to connect to server');
          setLoading(false);
        });
    }
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (downloadData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [downloadData, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success header */}
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

        {/* Download Section */}
        {loading && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8">
            <p className="text-gray-300">Preparing your download...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold mb-2">Oops!</h3>
            <p className="text-gray-200">{error}</p>
            <p className="text-sm mt-2">Don't worry - check your email for download links, or contact support@bscribe.ai</p>
          </div>
        )}

        {downloadData && !error && (
          <div className="bg-emerald-900 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              🎉 Your Book is Ready!
            </h2>
            
            <p className="text-emerald-200 mb-6">
              Download expires in: <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </p>

            <a
              href={downloadData.downloadUrl}
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-4 rounded-lg text-lg transform hover:scale-105 transition-all"
              download
            >
              📥 Download Your BS Now
            </a>

            <p className="text-sm text-emerald-300 mt-4">
              {downloadData.bookTitle}
            </p>
          </div>
        )}

        {/* Email notice */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">What Happens Next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-300">
                <strong>Instant Access:</strong> Download your book above before the timer expires
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">✉</span>
              </div>
              <p className="text-gray-300">
                <strong>Email Backup:</strong> We'll also email you a permanent download link within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Return button */}
        <Button
          variant="slim"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-3 rounded-lg"
          onClick={() => window.location.href = '/'}
        >
          Back to More Bad Decisions
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your success...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}