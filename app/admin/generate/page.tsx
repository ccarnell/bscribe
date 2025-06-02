'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AdminGeneratePage() {
  const [step, setStep] = useState<'start' | 'title' | 'chapters' | 'content'>('start');
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<any[]>([]);

  const generateTitle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'productivity' })
      });
      const data = await response.json();
      setBookData(data);
      setStep('title');
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const approveTitle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: bookData.bookId,
          title: bookData.title,
          subtitle: bookData.subtitle
        })
      });
      const data = await response.json();
      setBookData({ ...bookData, ...data });
      setStep('chapters');
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const approveChapters = () => {
    setStep('content');
    setCurrentChapter(0);
  };

  const generateChapterContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: bookData.bookId,
          chapterNumber: currentChapter + 1,
          chapterTitle: bookData.chapterTitles[currentChapter],
          previousChapters: completedChapters.map(ch => ch.content)
        })
      });
      const contentData = await response.json();

      // Get review
      const reviewResponse = await fetch('/api/generate/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentData.content,
          chapterTitle: contentData.chapterTitle,
          bookTitle: bookData.title,
          previousChapters: completedChapters.map(ch => ch.content)
        })
      });
      const reviewData = await reviewResponse.json();

      const chapterComplete = {
        ...contentData,
        review: reviewData.review
      };

      setCompletedChapters([...completedChapters, chapterComplete]);
      setCurrentChapter(currentChapter + 1);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BScribe Book Generator</h1>
      
      {step === 'start' && (
        <div className="space-y-4">
          <h2 className="text-xl">Ready to generate a new satirical self-help book?</h2>
          <Button onClick={generateTitle} loading={loading}>
            Generate Title & Subtitle
          </Button>
        </div>
      )}

      {step === 'title' && bookData && (
        <div className="space-y-4">
          <h2 className="text-xl">Generated Title:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-bold">{bookData.title}</h3>
            <p className="text-gray-600">{bookData.subtitle}</p>
            {bookData.absurdity && <p className="text-sm mt-2"><strong>Absurdity:</strong> {bookData.absurdity}</p>}
          </div>
          <div className="flex space-x-4">
            <Button onClick={approveTitle} loading={loading}>
              ✅ Approve & Generate Chapters
            </Button>
            <Button onClick={generateTitle} loading={loading} variant="slim">
              🔄 Regenerate Title
            </Button>
          </div>
        </div>
      )}

      {step === 'chapters' && bookData && (
        <div className="space-y-4">
          <h2 className="text-xl">Generated Chapters:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">{bookData.title}</h3>
            <ol className="list-decimal pl-6 space-y-1">
              {bookData.chapterTitles.map((chapter: string, i: number) => (
                <li key={i} className="text-sm">{chapter}</li>
              ))}
            </ol>
          </div>
          <div className="flex space-x-4">
            <Button onClick={approveChapters}>
              ✅ Approve & Start Content Generation
            </Button>
            <Button onClick={approveTitle} loading={loading} variant="slim">
              🔄 Regenerate Chapters
            </Button>
          </div>
        </div>
      )}

      {step === 'content' && bookData && (
        <div className="space-y-6">
          <h2 className="text-xl">Content Generation Progress</h2>
          
          <div className="bg-blue-50 p-4 rounded">
            <p><strong>Book:</strong> {bookData.title}</p>
            <p><strong>Progress:</strong> {completedChapters.length} / {bookData.chapterTitles.length} chapters completed</p>
          </div>

          {currentChapter < bookData.chapterTitles.length && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">
                Next: Chapter {currentChapter + 1}
              </h3>
              <p>{bookData.chapterTitles[currentChapter]}</p>
              <Button 
                onClick={generateChapterContent} 
                loading={loading}
                className="mt-2"
              >
                Generate Chapter {currentChapter + 1} Content + Review
              </Button>
            </div>
          )}

          {completedChapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Completed Chapters:</h3>
              {completedChapters.map((chapter, i) => (
                <div key={i} className="border p-4 rounded">
                  <h4 className="font-bold">Chapter {i + 1}: {chapter.chapterTitle}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {chapter.wordCount} words | 
                    Review Score: {chapter.review?.brandConsistency}/5
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {chapter.content.substring(0, 300)}...
                  </div>
                  {chapter.review?.screenshotMoments && (
                    <div className="mt-2">
                      <strong className="text-xs">Screenshot moments:</strong>
                      <ul className="text-xs text-green-600">
                        {chapter.review.screenshotMoments.slice(0, 2).map((moment: string, j: number) => (
                          <li key={j}>• "{moment.substring(0, 60)}..."</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentChapter >= bookData.chapterTitles.length && (
            <div className="bg-green-100 p-4 rounded">
              <h3 className="text-lg font-bold text-green-800">
                🎉 Book Complete!
              </h3>
              <p>All {bookData.chapterTitles.length} chapters generated successfully.</p>
              <p><strong>Total Words:</strong> {completedChapters.reduce((sum, ch) => sum + ch.wordCount, 0)}</p>
              <Button className="mt-2">
                📚 Export to PDF
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}