'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Success content component
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('processing');
  const [downloads, setDownloads] = useState<any[]>([]);
  const [purchaseType, setPurchaseType] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Wait a moment for webhook to process, then get downloads
      setTimeout(() => {
        getDownloads();
      }, 2000);
    }
  }, [sessionId]);

  const getDownloads = async () => {
    try {
      const response = await fetch('/api/get-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to get download info');
      }

      const result = await response.json();
      setDownloads(result.downloads);
      setPurchaseType(result.purchaseType);
      
      console.log(`Starting ${result.downloads.length} downloads for ${result.purchaseType} purchase`);
      
      // Auto-download each file with a small delay between them
      result.downloads.forEach((download: any, index: number) => {
        setTimeout(() => {
          console.log(`Downloading: ${download.filename}`);
          const a = document.createElement('a');
          a.href = download.url;
          a.download = download.filename;
          a.click();
        }, index * 1000); // 1 second delay between downloads
      });
      
      setStatus('success');
    } catch (error) {
      console.error('Download error:', error);
      setStatus('error');
    }
  };

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your BS..</p>
          <p className="mt-2 text-sm text-gray-400">Preparing your BS.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">A Bullshit Error Happened</h1>
          <p className="text-gray-300 mb-6">
            Don't worry! Your payment went through. Contact support with session: 
          </p>
          <p className="text-xs text-gray-500 mb-4 break-all">{sessionId}</p>
          <p className="text-sm text-gray-400">
            Or try downloading directly:
          </p>
          <div className="mt-4 space-y-2">
            <a 
              href="/api/file-proxy?path=individual/book-1-millionaire-mindset-acovado-toast.pdf"
              className="block text-emerald-500 hover:underline"
              download="millionaire-mindset.pdf"
            >
              📖 Download Millionaire Mindset Book
            </a>
            <a 
              href="/api/download-free"
              className="block text-emerald-500 hover:underline"
              target="_blank"
            >
              🆓 Download Free Book
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center max-w-md">
        <div className="text-emerald-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4">
          {purchaseType === 'bundle' ? 'Bundle Download Complete!' : 'Download Complete!'}
        </h1>
        <p className="text-gray-300 mb-6">Enjoy your Bullshit!</p>
        
        {downloads.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-3">
              {purchaseType === 'bundle' ? 
                `Downloaded ${downloads.length} files:` : 
                'Downloaded:'
              }
            </p>
            <div className="space-y-2">
              {downloads.map((download, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400">📄 {download.filename}</span>
                  <a 
                    href={download.url} 
                    download={download.filename}
                    className="text-blue-400 hover:underline text-xs"
                  >
                    Re-download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Check your browser's download folder. If downloads didn't start automatically, 
          use the re-download links above.
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
}

// Main component
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}