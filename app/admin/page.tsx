'use client';

import { useState } from 'react';

// The 7 book titles from your content strategy
const BOOK_TITLES = [
  "The Transformer Architecture and Avoiding Overload: How to Tokenize Your Trauma, Train Your Emotional Dataset, and Deploy a Reinforcement Learning Strategy That Disrupts Traditional Happiness Algorithms Using Multi-Modal Self-Attention Mechanisms for Those Who have Deteriorated",
  "The 7 Secrets of How to Hack the Art of Everything You Need to Know About the Science of Why Highly Effective People Think Like Millionaire Chowderheads: A Complete Idiot's Guide to the Power of Not Giving a Damn for Beginners",
  "E@t, Sh!t, Hu$tle: The Last 4-Hour Life-Hacking Guide You'll Ever Need to Break the Code of What Highly Successful People Do Before Breakfast And Forgetting Everything Your Human Therapist Told You",
  "From Broke-Ass Loser to Bomb-Ass Billionaire in 30 Minutes: The Definitive Method for Unlocking the Subtle Art of Why Smart People Think Different and You're Probably Doing It All Wrong, Bitch",
  "The 12 Rules for Life You Can't Seem to Follow: Ancient Wisdom that Millionaire Monks Don't Want You to Discover About Thinking Fast, Slow, and Not at All.",
  "Authentically Leveraging Your Personal Brand's \"Unique\" Synergy: Data-Driven Strategies That Top-Performing C-Suite Executives Use to Disrupt Their Mindset, Scale Their Thought Leadership, and Generate 10X ROI on Their Executive Presence While Building Meaningful B2B Relationships That Convert",
  "Zero-Shot Learning the Art of Zero-Shot Learning: A Gradient Descent Guide to Backpropagating Through Your Limiting Beliefs While Implementing Unsupervised Clustering of Your Authentic Self Using Edge Computing and Distributed Quantum Computing at Scale"
];

export default function AdminPage() {
  const [generating, setGenerating] = useState(false);
  const [currentBook, setCurrentBook] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const generateBook = async (title: string, pages: number = 10) => {
    setGenerating(true);
    setCurrentBook(title);
    setError('');
    
    try {
      const response = await fetch('/api/generate-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, pages })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(prev => [...prev, data]);
      } else {
        setError(`Failed to generate: ${data.error}`);
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setGenerating(false);
      setCurrentBook('');
    }
  };

  const generateAll = async () => {
    for (const title of BOOK_TITLES) {
      await generateBook(title, 15); // 15 pages each
      // Wait 2 seconds between books to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const downloadMarkdown = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">BScribe Book Generator (Admin)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4 mb-8">
        <button
          onClick={generateAll}
          disabled={generating}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
        >
          {generating ? `Generating: ${currentBook}` : 'Generate All 7 Books'}
        </button>
        
        <div className="text-sm text-gray-600">
          This will generate all 7 books with 15 pages each. 
          Total time: ~2-3 minutes
        </div>
      </div>
      
      {generating && (
        <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 rounded">
          <div className="font-semibold text-emerald-900">Currently generating:</div>
          <div className="text-sm text-emerald-700">{currentBook}</div>
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Generated Books:</h2>
        {results.map((book, index) => (
          <div key={index} className="border border-gray-300 bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{book.title}</h3>
            <div className="text-sm text-gray-700 mb-2">
              Words: {book.wordCount}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => downloadMarkdown(book.title, book.content)}
                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                Download Markdown
              </button>
              <details className="inline-block">
                <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                  Preview
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded text-xs overflow-auto max-h-96">
                  {book.content.substring(0, 1000)}...
                </pre>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}