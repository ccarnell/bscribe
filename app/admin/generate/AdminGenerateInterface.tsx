'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AdminGenerateInterface() {
  const [step, setStep] = useState<'start' | 'title' | 'chapters' | 'content'>('start');
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<any[]>([]);
  const [bookCompleted, setBookCompleted] = useState(false);
  const [revisionCount, setRevisionCount] = useState(0);

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
          bookId: bookData?.bookId,
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

  const generateChapterContent = async (isRetry = false) => {
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

      // Check if revision is needed
      if (reviewData.review.requiresRevision && !isRetry && revisionCount < 2) {
        console.log('Revision required:', reviewData.review.revisionReason);
        
        // Attempt revision
        const reviseResponse = await fetch('/api/generate/revise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: bookData.bookId,
            chapterNumber: currentChapter + 1,
            chapterTitle: bookData.chapterTitles[currentChapter],
            previousChapters: completedChapters.map(ch => ch.content),
            reviewFeedback: reviewData.review
          })
        });
        
        const revisedContent = await reviseResponse.json();
        
        // Get review of revised content
        const revisedReviewResponse = await fetch('/api/generate/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: revisedContent.content,
            chapterTitle: revisedContent.chapterTitle,
            bookTitle: bookData.title,
            previousChapters: completedChapters.map(ch => ch.content)
          })
        });
        const revisedReviewData = await revisedReviewResponse.json();
        
        setRevisionCount(revisionCount + 1);
        
        const chapterComplete = {
          ...revisedContent,
          review: revisedReviewData.review,
          wasRevised: true,
          originalReview: reviewData.review
        };
        
        setCompletedChapters([...completedChapters, chapterComplete]);
      } else {
        // Accept content as-is
        const chapterComplete = {
          ...contentData,
          review: reviewData.review,
          wasRevised: false
        };
        
        setCompletedChapters([...completedChapters, chapterComplete]);
      }
      
      // Move to next chapter
      if (currentChapter + 1 < bookData.chapterTitles.length) {
        setCurrentChapter(currentChapter + 1);
        setRevisionCount(0); // Reset revision count for next chapter
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const regenerateLastChapter = () => {
    setCompletedChapters(completedChapters.slice(0, -1));
    if (completedChapters.length < bookData.chapterTitles.length) {
      setCurrentChapter(currentChapter - 1);
    }
    setRevisionCount(0);
  };

  const finalizeBook = () => {
    setBookCompleted(true);
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

          {(() => {
            const isLastChapter = currentChapter + 1 === bookData.chapterTitles.length;
            const allChaptersGenerated = completedChapters.length === bookData.chapterTitles.length;
            const canGenerateNext = currentChapter < bookData.chapterTitles.length && !bookCompleted;

            return (
              <>
                {canGenerateNext && (
                  <div className="bg-gray-800 p-4 rounded border border-gray-600">
                    <h3 className="font-bold mb-2 text-white">
                      {isLastChapter ? 'Final Chapter' : `Next: Chapter ${currentChapter + 1}`}
                    </h3>
                    <p className="text-gray-300">{bookData.chapterTitles[currentChapter]}</p>
                    <div className="flex space-x-4 mt-2">
                      <Button 
                        onClick={() => generateChapterContent()} 
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

                {allChaptersGenerated && !bookCompleted && (
                  <div className="bg-yellow-900 p-4 rounded border border-yellow-700">
                    <h3 className="text-lg font-bold text-yellow-200 mb-2">
                      📝 All Chapters Generated!
                    </h3>
                    <p className="text-yellow-100 mb-4">
                      Review your chapters above. You can still regenerate the final chapter if needed.
                    </p>
                    <div className="flex space-x-4">
                      <Button 
                        onClick={finalizeBook}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✅ Finalize Book
                      </Button>
                      <Button 
                        onClick={regenerateLastChapter}
                        variant="slim"
                      >
                        🔄 Regenerate Final Chapter
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {completedChapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Completed Chapters:</h3>
              {completedChapters.map((chapter, i) => (
                <div key={i} className="border border-gray-600 p-4 rounded bg-gray-800">
                  <h4 className="font-bold text-white">
                    Chapter {i + 1}: {chapter.chapterTitle} 
                    {chapter.wasRevised && <span className="text-yellow-400 ml-2">(Revised)</span>}
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    {chapter.wordCount} words | 
                    Brand: {chapter.review?.brandConsistency}/5 | 
                    Energy: {chapter.review?.energyLevel}/5 |
                    Variety: {chapter.review?.varietyScore}/5
                  </p>
                  
                  {/* Revision indicator */}
                  {chapter.wasRevised && (
                    <div className="bg-yellow-900 p-2 rounded text-sm mb-3 border border-yellow-700">
                      <p className="text-yellow-200">
                        🔄 This chapter was automatically revised due to: {chapter.originalReview.revisionReason}
                      </p>
                    </div>
                  )}
                  
                  {/* Content preview */}
                  <details className="mb-3">
                    <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300">
                      View Chapter Content
                    </summary>
                    <div className="bg-gray-900 p-4 rounded text-sm text-gray-200 mt-2 border border-gray-700">
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{chapter.content}</div>
                    </div>
                  </details>

                  {/* Review */}
                  {chapter.review && (
                    <div className="bg-blue-900 p-4 rounded text-sm border border-blue-700">
                      <h5 className="font-semibold mb-3 text-blue-200">Review Analysis:</h5>
                      <div className="text-blue-100 space-y-2">
                        <p><strong>Assessment:</strong> {chapter.review.brandComment}</p>
                        {chapter.review.formulaicFlags?.length > 0 && (
                          <p><strong>Patterns Detected:</strong> {chapter.review.formulaicFlags.join(', ')}</p>
                        )}
                        {chapter.review.screenshotMoments && chapter.review.screenshotMoments.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-green-300">🔥 Best Lines:</strong>
                            <ul className="text-sm text-green-100 mt-1">
                              {chapter.review.screenshotMoments.slice(0, 2).map((moment: string, j: number) => (
                                <li key={j} className="italic">"{moment}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {bookCompleted && (
            <div className="bg-green-900 p-4 rounded border border-green-700">
              <h3 className="text-lg font-bold text-green-200">
                🎉 Book Complete!
              </h3>
              <p className="text-green-100">All {bookData.chapterTitles.length} chapters generated successfully.</p>
              <p className="text-green-100"><strong>Total Words:</strong> {completedChapters.reduce((sum, ch) => sum + ch.wordCount, 0)}</p>
              <p className="text-green-100"><strong>Chapters Revised:</strong> {completedChapters.filter(ch => ch.wasRevised).length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}