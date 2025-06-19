'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

// TypeScript interfaces
interface DownloadData {
  success: boolean;
  downloadUrl: string;
  bookTitle: string;
  error?: string;
  isBundle?: boolean;
  downloads?: Array<{
    title: string;
    downloadUrl: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  downloadUrl?: string;
  bookTitle?: string;
  error?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Fetch download link
      fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
        .then(res => res.json())
        .then((data: any) => {
          if (data.success) {
            setDownloadData(data);
          } else {
            setError(data.error || 'Failed to load download');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Download fetch error:', err);
          setError('Failed to connect to server');
          setLoading(false);
        });
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (downloadData && timeLeft > 0 && !isExpired) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [downloadData, timeLeft, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToHome = () => {
    router.push('/');
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

        {/* Loading Section */}
        {loading && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8">
            <p className="text-gray-300">Preparing your download...</p>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="bg-red-900 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold mb-2">Oops!</h3>
            <p className="text-gray-200">{error}</p>
            <p className="text-sm mt-2">Please contact support@bscribe.ai if this issue persists</p>
          </div>
        )}

        {/* Download Section */}
        {downloadData && !error && (
          <div className="bg-emerald-900 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              🎉 Your {downloadData.isBundle ? 'Bundle is' : 'Book is'} Ready!
            </h2>
            
            {isExpired ? (
              <div className="bg-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200 font-bold">⏰ Download Link Expired</p>
                <p className="text-red-300 text-sm mt-2">
                  Your download window has expired. Please contact support@bscribe.ai for assistance.
                </p>
              </div>
            ) : (
              <>
                <p className="text-emerald-200 mb-6">
                  Download expires in: <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
                </p>

                {downloadData.isBundle && downloadData.downloads ? (
                  <div className="space-y-3">
                    {downloadData.downloads.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.downloadUrl}
                        className="block bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-lg transform hover:scale-105 transition-all"
                        download
                      >
                        📥 Download: {item.title}
                      </a>
                    ))}
                  </div>
                ) : (
                  <a
                    href={downloadData.downloadUrl}
                    className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-4 rounded-lg text-lg transform hover:scale-105 transition-all"
                    download
                  >
                    📥 Download Your BS Now
                  </a>
                )}
              </>
            )}

            <p className="text-sm text-emerald-300 mt-4">
              {downloadData.bookTitle}
            </p>
          </div>
        )}

        {/* Download notice */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Important Notice</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">⏰</span>
              </div>
              <p className="text-gray-300">
                <strong>Time Sensitive:</strong> Download your book above before the timer expires
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-sm font-bold">💾</span>
              </div>
              <p className="text-gray-300">
                <strong>Save Immediately:</strong> Once downloaded, save the PDF to your device for permanent access
              </p>
            </div>
          </div>
        </div>

        {/* Return button */}
        <Button
          variant="slim"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-3 rounded-lg"
          onClick={handleBackToHome}
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
