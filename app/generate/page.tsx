import React from 'react';
import { GeneratorForm } from '@/components/ui/TitleGenerator';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'Generate Your Own BS Title | BScribe.ai',
  description: 'Create your own satirical self-help book titles with AI and let the community vote on which ones should become real books.',
};

export default function GeneratePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Generate Your Own <span className="text-emerald-500">BS</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Create satirical book titles with AI and let the community decide which ones become real books. 
            The best titles get turned into full satirical ebooks.
          </p>
        </div>
        
        {/* Navigation */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
            <Link 
              href="/generate" 
              className="px-6 py-3 rounded-md bg-emerald-500 text-black font-bold transition-all"
            >
              Generate
            </Link>
            <Link 
              href="/vote" 
              className="px-6 py-3 rounded-md text-white hover:bg-zinc-700 transition-all"
            >
              Vote
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <GeneratorForm />
        </div>
        
        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card 
            title="How It Works" 
            description="Your path from idea to published satirical masterpiece"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Generate Titles</h3>
                <p className="text-gray-400 text-sm">
                  Use AI to create satirical book titles. You get 3 slots with up to 4 generations each.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Community Votes</h3>
                <p className="text-gray-400 text-sm">
                  Submit your favorites and let the community vote on which titles are the funniest.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Books Get Made</h3>
                <p className="text-gray-400 text-sm">
                  Top-voted titles become real satirical ebooks, complete with chapters and content.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-700">
            <span>💡</span>
            <span>
              Every title generation costs us money in API fees. Please be considerate with rate limits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
