'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    if (sessionId) {
      downloadFiles();
    }
  }, [sessionId]);

  const downloadFiles = async () => {
    try {
      const response = await fetch('/api/download-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Download each file
        for (const fileUrl of result.downloadUrls) {
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = '';
          a.click();
        }
        
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Download error:', error);
      setStatus('error');
    }
  };

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Download Error</h1>
          <p className="text-gray-600">Please contact support with session: {sessionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4">Download Complete!</h1>
        <p className="text-gray-600">Thank you for your purchase.</p>
      </div>
    </div>
  );
}