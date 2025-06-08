'use client';

import React from 'react';

interface RateLimitMessageProps {
  message: string;
  isGlobal?: boolean;
}

export default function RateLimitMessage({ message, isGlobal = false }: RateLimitMessageProps) {
  return (
    <div className={`rounded-lg p-4 ${isGlobal ? 'bg-red-900/20' : 'bg-yellow-900/20'} border ${isGlobal ? 'border-red-800' : 'border-yellow-800'} mb-6`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${isGlobal ? 'text-red-400' : 'text-yellow-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${isGlobal ? 'text-red-300' : 'text-yellow-300'}`}>
            {isGlobal ? 'Server Rate Limit' : 'Your Rate Limit'}
          </h3>
          <div className={`mt-2 text-sm ${isGlobal ? 'text-red-200' : 'text-yellow-200'}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}