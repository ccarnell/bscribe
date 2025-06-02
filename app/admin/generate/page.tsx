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
        body: JSON.stringify({ context: '' })
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
          bookId: bookData?.bookId, // Pass existing bookId if regenerating
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

  const regenerateLastChapter = () => {
    setCompletedChapters(completedChapters.slice(0, -1));
    setCurrentChapter(currentChapter - 1);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl text-white">
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
          <div className="bg-gray-800 p-4 rounded border border-gray-600">
            <h3 className="text-lg font-bold text-white">{bookData.title}</h3>
            <p className="text-gray-300">{bookData.subtitle}</p>
            {bookData.absurdity && <p className="text-sm mt-2 text-gray-300"><strong>Absurdity:</strong> {bookData.absurdity}</p>}
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
          <div className="bg-gray-800 p-4 rounded border border-gray-600">
            <h3 className="font-bold mb-2 text-white">{bookData.title}</h3>
            <ol className="list-decimal pl-6 space-y-1">
              {bookData.chapterTitles.map((chapter: string, i: number) => (
                <li key={i} className="text-sm text-gray-300">{chapter}</li>
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
          
          <div className="bg-blue-900 p-4 rounded border border-blue-700">
            <p className="text-blue-100"><strong>Book:</strong> {bookData.title}</p>
            <p className="text-blue-100"><strong>Progress:</strong> {completedChapters.length} / {bookData.chapterTitles.length} chapters completed</p>
          </div>

          {currentChapter < bookData.chapterTitles.length && (
            <div className="bg-gray-800 p-4 rounded border border-gray-600">
              <h3 className="font-bold mb-2 text-white">
                Next: Chapter {currentChapter + 1}
              </h3>
              <p className="text-gray-300">{bookData.chapterTitles[currentChapter]}</p>
              <div className="flex space-x-4 mt-2">
                <Button 
                  onClick={generateChapterContent} 
                  loading={loading}
                >
                  Generate Chapter {currentChapter + 1} Content + Review
                </Button>
                {completedChapters.length > 0 && (
                  <Button 
                    onClick={regenerateLastChapter}
                    variant="slim"
                  >
                    🔄 Regenerate Last Chapter
                  </Button>
                )}
              </div>
            </div>
          )}

          {completedChapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Completed Chapters:</h3>
              {completedChapters.map((chapter, i) => (
                <div key={i} className="border border-gray-600 p-4 rounded bg-gray-800">
                  <h4 className="font-bold text-white">Chapter {i + 1}: {chapter.chapterTitle}</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    {chapter.wordCount} words | 
                    Brand Consistency: {chapter.review?.brandConsistency}/5 | 
                    Energy Level: {chapter.review?.energyLevel}/5
                  </p>
                  
                  {/* Full Chapter Content */}
                  <div className="bg-gray-900 p-4 rounded text-sm text-gray-200 mb-4 border border-gray-700">
                    <h5 className="font-semibold mb-2 text-white">Chapter Content:</h5>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{chapter.content}</div>
                  </div>

                  {/* Review Agent Feedback */}
                  {chapter.review && (
                    <div className="bg-blue-900 p-4 rounded text-sm mb-3 border border-blue-700">
                      <h5 className="font-semibold mb-3 text-blue-200">Review Agent Analysis:</h5>
                      <div className="text-blue-100 space-y-2">
                        <p><strong>Overall Assessment:</strong> {chapter.review.brandComment}</p>
                        <p><strong>Satirical Balance:</strong> {chapter.review.satiricalBalance || 'Not specified'}</p>
                        {chapter.review.formulaicFlags?.length > 0 && (
                          <p><strong>Pattern Warnings:</strong> {chapter.review.formulaicFlags.join(', ')}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <strong className="text-green-300">Keep Doing:</strong>
                            <ul className="text-sm mt-1">
                              {chapter.review.recommendations?.keep?.map((item: string, j: number) => (
                                <li key={j}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-yellow-300">Consider:</strong>
                            <ul className="text-sm mt-1">
                              {chapter.review.recommendations?.consider?.map((item: string, j: number) => (
                                <li key={j}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-red-300">Watch Out:</strong>
                            <ul className="text-sm mt-1">
                              {chapter.review.recommendations?.watch?.map((item: string, j: number) => (
                                <li key={j}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screenshot Moments - Social Media Gold */}
                  {chapter.review?.screenshotMoments && (
                    <div className="bg-green-900 p-3 rounded border border-green-700">
                      <strong className="text-green-200">🔥 Social Media Gold (Screenshot-Worthy Lines):</strong>
                      <p className="text-xs text-green-300 mb-2">These are the most quotable/shareable lines from this chapter</p>
                      <ul className="text-sm text-green-100 mt-2">
                        {chapter.review.screenshotMoments.map((moment: string, j: number) => (
                          <li key={j} className="mb-2 p-2 bg-green-800 rounded">"{moment}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentChapter >= bookData.chapterTitles.length && (
            <div className="bg-green-900 p-4 rounded border border-green-700">
              <h3 className="text-lg font-bold text-green-200">
                🎉 Book Complete!
              </h3>
              <p className="text-green-100">All {bookData.chapterTitles.length} chapters generated successfully.</p>
              <p className="text-green-100"><strong>Total Words:</strong> {completedChapters.reduce((sum, ch) => sum + ch.wordCount, 0)}</p>
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