'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TitleCardProps {
  id: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  voteCount: number;
  isVoted?: boolean;
  onVote?: (id: string) => void;
  showVoteButton?: boolean;
}

export default function TitleCard({
  id,
  title,
  subtitle,
  generatedAt,
  voteCount,
  isVoted = false,
  onVote,
  showVoteButton = true
}: TitleCardProps) {
  const handleVote = () => {
    if (onVote) {
      onVote(id);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 hover:bg-[#2d2d2d] transition-colors">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm mb-4">{subtitle}</p>
      
      <div className="mt-4">
        {showVoteButton && (
          <div className="flex flex-col items-end">
            <button
              onClick={handleVote}
              className={`flex items-center space-x-1 ${
                isVoted 
                  ? 'text-emerald-400 hover:text-emerald-300' 
                  : 'text-gray-300 hover:text-emerald-400'
              } transition-colors mb-2`}
            >
              <span className="mr-1 font-bold">{Math.max(0, voteCount)}</span>
              <span className="text-lg" role="img" aria-label="poop emoji">
                💩
              </span>
            </button>
            <div className="flex justify-between items-center w-full">
              <div className="text-gray-400 text-sm">
                {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
              </div>
              <span className="text-sm">
                {isVoted ? "Real people would read this BS!" : "Real people would read this BS"}
              </span>
            </div>
          </div>
        )}
        
        {!showVoteButton && (
          <div className="text-gray-400 text-sm">
            {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
}