'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h2 className="text-2xl font-bold mb-4">This is Bullshit! Something went wrong.</h2>
      <p className="text-gray-400 mb-6">
        We're having technical difficulties. Our team has received a strongly worded letter to get on this ASAP.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}