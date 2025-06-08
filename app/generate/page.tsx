import React from 'react';
import { GeneratorForm } from '@/components/ui/TitleGenerator';
import Link from 'next/link';

export const metadata = {
  title: 'Generate Your Own BS Title | BScribe.ai',
  description: 'Create your own satirical self-help book titles with AI and let the community vote on which ones should become real books.',
};

export default function GeneratePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Generate Your Own <span className="text-emerald-500">BS</span>
          </h1>
          <p className="text-lg text-gray-300">
            Create satirical self-help book titles and let the community decide which ones become real books.
          </p>
        </div>
        
        <div className="mb-8 flex justify-center space-x-4">
          <Link 
            href="/generate" 
            className="px-4 py-2 rounded bg-emerald-500 text-black font-bold"
          >
            Generate
          </Link>
          <Link 
            href="/vote" 
            className="px-4 py-2 rounded bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]"
          >
            Vote
          </Link>
        </div>
        
        <GeneratorForm />
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Every title you generate costs us money in API fees. <br />
            Please be considerate and stay within the rate limits.
          </p>
        </div>
      </div>
    </div>
  );
}