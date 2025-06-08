'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import RateLimitMessage from './RateLimitMessage';
import TitleSlot from './TitleSlot';
import { useRouter } from 'next/navigation';

interface TitleSlotData {
  title: string | null;
  subtitle: string | null;
  apiCallsUsed: number;
  selected: boolean;
}

interface SessionData {
  titleSlots: TitleSlotData[];
  totalApiCallsUsed: number;
  lastReset: string;
}

// Constants
const MAX_API_CALLS = 12;
const MAX_CALLS_PER_SLOT = 4;
const INITIAL_SLOTS: TitleSlotData[] = [
  { title: null, subtitle: null, apiCallsUsed: 0, selected: false },
  { title: null, subtitle: null, apiCallsUsed: 0, selected: false },
  { title: null, subtitle: null, apiCallsUsed: 0, selected: false }
];

export default function GeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isGlobalRateLimited, setIsGlobalRateLimited] = useState(false);
  const [titleSlots, setTitleSlots] = useState<TitleSlotData[]>(INITIAL_SLOTS);
  const [totalApiCallsUsed, setTotalApiCallsUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  // Check if we're in development environment
  const [isDev, setIsDev] = useState(false);
  
  // Initialize from session storage on load
  useEffect(() => {
    // Check for development environment
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true);
    }
    
    // Load saved state from session storage
    const savedSession = sessionStorage.getItem('bscribe_title_generator_session');
    if (savedSession) {
      try {
        const session: SessionData = JSON.parse(savedSession);
        
        // Check if we need to reset (new day)
        const today = new Date().toDateString();
        if (session.lastReset !== today && !isDev) {
          // Reset session for a new day
          resetSession();
        } else {
          // Restore saved session
          setTitleSlots(session.titleSlots);
          setTotalApiCallsUsed(session.totalApiCallsUsed);
          
          // Check if user has hit rate limit
          if (session.totalApiCallsUsed >= MAX_API_CALLS && !isDev) {
            setIsRateLimited(true);
          }
        }
      } catch (err) {
        console.error('Error parsing saved session:', err);
        resetSession();
      }
    } else {
      // Initialize new session
      resetSession();
    }
  }, []);

  // Save state to session storage whenever it changes
  useEffect(() => {
    const sessionData: SessionData = {
      titleSlots,
      totalApiCallsUsed,
      lastReset: new Date().toDateString()
    };
    
    sessionStorage.setItem('bscribe_title_generator_session', JSON.stringify(sessionData));
  }, [titleSlots, totalApiCallsUsed]);

  // Reset session (for new day or initialization)
  const resetSession = () => {
    setTitleSlots(INITIAL_SLOTS);
    setTotalApiCallsUsed(0);
    setIsRateLimited(false);
    
    const sessionData: SessionData = {
      titleSlots: INITIAL_SLOTS,
      totalApiCallsUsed: 0,
      lastReset: new Date().toDateString()
    };
    
    sessionStorage.setItem('bscribe_title_generator_session', JSON.stringify(sessionData));
  };

  const handleGenerate = async (slotIndex: number) => {
    if (totalApiCallsUsed >= MAX_API_CALLS && !isDev) {
      setIsRateLimited(true);
      return;
    }
    
    if (titleSlots[slotIndex].apiCallsUsed >= MAX_CALLS_PER_SLOT && !isDev) {
      setError(`Slot ${slotIndex + 1} has reached the maximum of ${MAX_CALLS_PER_SLOT} API calls.`);
      return;
    }
    
    setLoading(true);
    setLoadingSlot(slotIndex);
    setError(null);
    
    try {
      const response = await fetch('/api/user-titles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slotIndex })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          // Check if we're in development mode (from API response)
          if (data.dev) {
            console.log('Development mode: bypassing rate limits');
            // Continue processing without error
          } else {
            // Check if it's a global or individual rate limit
            if (data.error?.includes('Global')) {
              setIsGlobalRateLimited(true);
            } else {
              setIsRateLimited(true);
            }
            return;
          }
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
          return;
        }
      }
      
      // Update the slot with new title
      const updatedSlots = [...titleSlots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        title: data.title,
        subtitle: data.subtitle,
        apiCallsUsed: updatedSlots[slotIndex].apiCallsUsed + 1
      };
      
      setTitleSlots(updatedSlots);
      
      // Update total API calls used
      if (!isDev && !data.dev) {
        const newTotal = totalApiCallsUsed + 1;
        setTotalApiCallsUsed(newTotal);
        
        if (newTotal >= MAX_API_CALLS) {
          setIsRateLimited(true);
        }
      }
      
    } catch (err) {
      setError('Failed to generate title. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingSlot(null);
    }
  };

  const handleSelectSlot = (slotIndex: number, selected: boolean) => {
    const updatedSlots = [...titleSlots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      selected
    };
    
    setTitleSlots(updatedSlots);
  };

  const handleSubmitSelected = async () => {
    const selectedTitles = titleSlots.filter(slot => 
      slot.selected && slot.title && slot.subtitle
    );
    
    if (selectedTitles.length === 0) {
      setError('Please select at least one title to submit.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user-titles/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedTitles: selectedTitles.map(slot => ({
            title: slot.title,
            subtitle: slot.subtitle
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to submit titles.');
        return;
      }
      
      // Clear selected titles after successful submission
      const updatedSlots = titleSlots.map(slot => 
        slot.selected ? { ...slot, selected: false } : slot
      );
      
      setTitleSlots(updatedSlots);
      setSubmitSuccess(true);
      
      // Show success message briefly, then navigate to voting page
      setTimeout(() => {
        router.push('/vote');
      }, 2000);
      
    } catch (err) {
      setError('Failed to submit titles. Please try again later.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCount = () => {
    return titleSlots.filter(slot => slot.selected).length;
  };

  const handleVoteButtonClick = () => {
    router.push('/vote');
  };

  return (
    <div>
      {isDev && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300">Development Mode</h3>
              <div className="mt-2 text-sm text-blue-200">
                <p>Rate limits are bypassed in development mode.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isRateLimited && !isDev && (
        <RateLimitMessage 
          message={`You've reached the limit of ${MAX_API_CALLS} API calls per day. Come back tomorrow for more!`}
        />
      )}
      
      {isGlobalRateLimited && !isDev && (
        <RateLimitMessage 
          message="Our servers are working overtime! The global generation limit has been reached. Please try again later." 
          isGlobal
        />
      )}
      
      {submitSuccess && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-emerald-300">Success!</h3>
              <div className="mt-2 text-sm text-emerald-200">
                <p>Your titles have been submitted. Redirecting to voting page...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Generate Your Satirical Book Titles</h2>
          <div className={`text-sm ${totalApiCallsUsed >= MAX_API_CALLS && !isDev ? 'text-red-400' : 'text-gray-300'}`}>
            API calls used: {totalApiCallsUsed}/{MAX_API_CALLS}
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          You have 3 title slots, with up to 4 API calls per slot. Generate titles, then select your favorites to submit for community voting.
        </p>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {/* Title Slots */}
        {titleSlots.map((slot, index) => (
          <TitleSlot
            key={index}
            index={index}
            title={slot.title}
            subtitle={slot.subtitle}
            apiCallsUsed={slot.apiCallsUsed}
            maxApiCalls={MAX_CALLS_PER_SLOT}
            selected={slot.selected}
            onGenerate={handleGenerate}
            onSelect={handleSelectSlot}
            loading={loading}
            loadingSlot={loadingSlot}
          />
        ))}
        
        {/* Submit Button */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 mb-4 md:mb-0">
            {getSelectedCount()} title{getSelectedCount() !== 1 ? 's' : ''} selected for submission
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmitSelected}
              variant="emerald"
              loading={submitting}
              disabled={getSelectedCount() === 0 || submitting}
              className="px-6 py-2"
            >
              Submit Selected Titles
            </Button>
            
            <Button 
              onClick={handleVoteButtonClick}
              variant="slim"
              className="px-4 py-2"
            >
              View All Titles
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2d2d2d] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">How It Works</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Generate up to 3 different title slots</li>
          <li>Each slot can be regenerated up to 4 times</li>
          <li>Select your favorites to submit for community voting</li>
          <li>Total limit: 12 API calls per day</li>
          <li>Upvote titles you think should become real books</li>
        </ul>
      </div>
    </div>
  );
}