import React from 'react';
import { VotingInterface } from '@/components/ui/TitleGenerator';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'Vote on BS Titles | BScribe.ai',
  description: 'Vote on community-generated satirical self-help book titles to decide which ones become real BS ebooks.',
};

export default function VotePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Vote on the <span className="text-emerald-500">BS</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Help decide which community-generated titles deserve to become real satirical ebooks. 
            Your votes shape what gets published next.
          </p>
        </div>
        
        {/* Navigation */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
            <Link 
              href="/generate" 
              className="px-6 py-3 rounded-md text-white hover:bg-zinc-700 transition-all"
            >
              Generate
            </Link>
            <Link 
              href="/vote" 
              className="px-6 py-3 rounded-md bg-emerald-500 text-black font-bold transition-all"
            >
              Vote
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <VotingInterface />
        </div>
        
        {/* Voting Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card 
            title="How Voting Works" 
            description="Your votes directly influence which books get made"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-black font-bold">👍</span>
                  </span>
                  Vote for Favorites
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upvote titles that make you laugh, cringe, or perfectly capture the absurdity 
                  of their respective industries. The funniest and most relatable titles rise to the top.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-black font-bold">📚</span>
                  </span>
                  Books Get Made
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Top-voted titles are selected monthly to become full satirical ebooks. 
                  Complete with chapters, content, and all the BS you'd expect.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-semibold text-white">Monthly Selection</h4>
                  <p className="text-gray-400 text-sm">
                    We publish new satirical ebooks monthly based on community votes. 
                    The most popular titles become real books with full content.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center space-y-4 bg-zinc-900 px-8 py-6 rounded-lg border border-zinc-700">
            <p className="text-gray-300">
              Have an idea for a satirical book title?
            </p>
            <Link 
              href="/generate" 
              className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-md transition-colors"
            >
              Create Your Own Title →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
