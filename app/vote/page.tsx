import React from 'react';
import { VotingInterface } from '@/components/ui/TitleGenerator';
import Link from 'next/link';

export const metadata = {
  title: 'Vote on BS Titles | BScribe.ai',
  description: 'Vote on community-generated satirical self-help book titles to decide which ones become real BS ebooks.',
};

export default function VotePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Vote on the <span className="text-emerald-500">BS</span>
          </h1>
          <p className="text-lg text-gray-300">
            Help us decide which community-generated titles deserve to become real satirical ebooks.
          </p>
        </div>
        
        <div className="mb-8 flex justify-center space-x-4">
          <Link 
            href="/generate" 
            className="px-4 py-2 rounded bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]"
          >
            Generate
          </Link>
          <Link 
            href="/vote" 
            className="px-4 py-2 rounded bg-emerald-500 text-black font-bold"
          >
            Vote
          </Link>
        </div>
        
        <VotingInterface />
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Top voted titles may be selected to become real satirical ebooks.<br />
            We publish new books monthly based on community votes.
          </p>
          <Link 
            href="/generate" 
            className="inline-block mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Create your own title →
          </Link>
        </div>
      </div>
    </div>
  );
}