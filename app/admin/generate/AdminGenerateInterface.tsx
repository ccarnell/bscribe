// app/admin/generate/AdminGenerateInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface ChapterData {
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  wordCount: number;
  review: any;
  attempts: number;
  wasRevised: boolean;
}

interface ContentResponse {
  success: boolean;
  bookId: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  wordCount: number;
  revision?: boolean;
}

interface ReviewResponse {
  success: boolean;
  review: {
    satireScore: number;
    varietyScore: number;
    absurdityScore: number;
    requiresRevision: boolean;
    revisionReason?: string;
    recommendations: string[];
    formulaicPatterns: string[];
    bestLines: string[];
  };
}

<Link href="/admin/analytics" className="...">
  📊 View Analytics
</Link>

export default function AdminGenerateInterface() {
  const [step, setStep] = useState<'start' | 'title' | 'chapters' | 'content'>('start');
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<ChapterData[]>([]);
  const [bookCompleted, setBookCompleted] = useState(false);
  const [bookId, setBookId] = useState<string>('');
  const [useExistingTitle, setUseExistingTitle] = useState(false);
  const [availableTitles, setAvailableTitles] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loadingTitles, setLoadingTitles] = useState(false);

  const loadPendingTitles = async () => {
    setLoadingTitles(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('book_generations')
        .select('*')
        .eq('status', 'pending')
        .eq('current_step', 'awaiting_chapters')
        .is('chapters', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableTitles(data || []);
      if (data && data.length > 0) {
        setSelectedBookId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading titles:', error);
    } finally {
      setLoadingTitles(false);
    }
  };

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
      let titleToUse = bookData?.title;
      let subtitleToUse = bookData?.subtitle;
      let bookIdToUse = bookData?.bookId;

      // ↓ NEW CODE: Check if we're using an existing title ↓
      if (useExistingTitle && selectedBookId) {
        const selectedBook = availableTitles.find(book => book.id === selectedBookId);
        if (selectedBook) {
          titleToUse = selectedBook.title;
          subtitleToUse = selectedBook.subtitle;
          bookIdToUse = selectedBook.id;

          // Update bookData with the selected title
          setBookData({
            ...bookData,
            title: titleToUse,
            subtitle: subtitleToUse,
            bookId: bookIdToUse
          });
        }
      }
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

  // Then update the generateChapterContent function:
  const generateChapterContent = async () => {
    setLoading(true);
    const maxAttempts = 2;
    let attempts = 0;
    let currentChapterData: ChapterData | null = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;

        // Generate content
        console.log(`Generating chapter ${currentChapter + 1}, attempt ${attempts}`);
        const response = await fetch('/api/generate/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: bookData.bookId,
            chapterNumber: currentChapter + 1,
            chapterTitle: bookData.chapterTitles[currentChapter],
            previousChapters: completedChapters.map(ch => ch.content),
            isRevision: attempts > 1,
            revisionGuidance: attempts > 1 && currentChapterData?.review?.recommendations
              ? currentChapterData.review.recommendations.join('\n')
              : ''
          })
        });
        const contentData: ContentResponse = await response.json();

        console.log('=== CONTENT GENERATION RESPONSE ===');
        console.log('Success:', contentData.success);
        console.log('Content length:', contentData.content?.length);
        console.log('First 200 chars:', contentData.content?.substring(0, 200));

        // Get review
        console.log('Getting review for generated content...');
        const reviewRes = await fetch('/api/generate/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: contentData.content,
            chapterTitle: contentData.chapterTitle
          })
        });
        const reviewData: ReviewResponse = await reviewRes.json();

        // Store chapter data
        currentChapterData = {
          chapterNumber: currentChapter + 1,
          chapterTitle: bookData.chapterTitles[currentChapter],
          content: contentData.content,
          wordCount: contentData.wordCount,
          review: reviewData.review,
          attempts: attempts,
          wasRevised: attempts > 1
        };

        // Log review results
        console.log('Review Results:', {
          satireScore: reviewData.review?.satireScore,
          varietyScore: reviewData.review?.varietyScore,
          requiresRevision: reviewData.review?.requiresRevision,
          reason: reviewData.review?.revisionReason
        });

        console.log('=== REVIEW RESPONSE ===');
        console.log('Review data:', reviewData);
        console.log('Requires revision?', reviewData.review?.requiresRevision);
        console.log('Scores:', {
          satire: reviewData.review?.satireScore,
          variety: reviewData.review?.varietyScore,
          absurdity: reviewData.review?.absurdityScore
        });

        // Check if revision is needed
        if (reviewData.review?.requiresRevision && attempts < maxAttempts) {
          console.log('🔄 REVISION TRIGGERED - Attempting regeneration...');
          continue; // Try again
        } else {
          console.log('✅ CHAPTER ACCEPTED');
          break;
        }

      } catch (error) {
        console.error('Error generating chapter:', error);
        break;
      }
    }

    if (currentChapterData) {
      // Save completed chapter
      setCompletedChapters([...completedChapters, currentChapterData]);

      // Move to next chapter or finish
      if (currentChapter + 1 < bookData.chapterTitles.length) {
        setCurrentChapter(currentChapter + 1);
      } else {
        setBookCompleted(true);
      }
    }

    setLoading(false);
  };

  const regenerateLastChapter = () => {
    if (completedChapters.length > 0) {
      setCompletedChapters(completedChapters.slice(0, -1));
      setCurrentChapter(Math.max(0, currentChapter - 1));
      setBookCompleted(false);
    }
  };

  const exportBook = async () => {
    const bookContent = {
      title: bookData.title,
      subtitle: bookData.subtitle,
      chapters: completedChapters.map(ch => ({
        title: ch.chapterTitle,
        content: ch.content
      }))
    };

    // Create a downloadable JSON file
    const blob = new Blob([JSON.stringify(bookContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl text-white">
      {/* Header with navigation */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">BScribe Book Generator</h1>
        <Link
          href="/admin/analytics"
          className="bg-emerald-400 hover:bg-emerald-300 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          📊 View Analytics
        </Link>
      </div>

      {step === 'start' && (
        <div className="space-y-4">
          <h2 className="text-xl">Ready to generate a new satirical self-help book?</h2>
          <Button onClick={generateTitle} loading={loading}>
            Generate Title & Subtitle
          </Button>

          <div className="mb-6 p-4 border border-emerald-500 rounded-lg">
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={useExistingTitle}
                onChange={(e) => setUseExistingTitle(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="font-semibold">Use Existing Title from Database</span>
            </label>

            {useExistingTitle && (
              <div className="mt-4">
                {loadingTitles ? (
                  <p>Loading available titles...</p>
                ) : availableTitles.length > 0 ? (
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Select a title to generate chapters for:
                    </label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-700 text-white"
                    >
                      {availableTitles.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title.substring(0, 60)}...
                        </option>
                      ))}
                    </select>
                    {selectedBookId && (
                      <div className="mt-2 p-3 bg-gray-700 rounded text-sm">
                        <p className="font-semibold">Selected Title:</p>
                        <p>{availableTitles.find(b => b.id === selectedBookId)?.title}</p>
                        <p className="mt-1 text-gray-400">
                          {availableTitles.find(b => b.id === selectedBookId)?.subtitle}
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setStep('title');
                        approveTitle();
                      }}
                      loading={loading}
                      className="mt-4"
                    >
                      Use This Title & Generate Chapters
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No pending titles found. Insert a title into the database first.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded">
            <h3 className="text-lg mb-2">Resume Previous Book</h3>
            <input
              type="text"
              placeholder="Paste Book ID to resume"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded w-full mb-2"
            />
            <Button
              onClick={async () => {
                if (!bookId) return;
                setLoading(true);

                try {
                  // Create a simple API endpoint to fetch book data
                  const response = await fetch(`/api/admin/book/${bookId}`);
                  const data = await response.json();

                  if (!data.success) {
                    alert('Book not found');
                    setLoading(false);
                    return;
                  }

                  // Restore the book data
                  setBookData({
                    bookId: data.book.id,
                    title: data.book.title,
                    subtitle: data.book.subtitle,
                    chapterTitles: data.book.chapters,
                    rawResponse: ''
                  });

                  // Restore completed chapters
                  setCompletedChapters(data.book.chapter_content || []);
                  setCurrentChapter(data.book.chapter_content?.length || 0);

                  // Check if book is actually complete
                  const totalChapters = data.book.chapters?.length || 0;
                  const completedCount = data.book.chapter_content?.length || 0;
                  if (completedCount === totalChapters && totalChapters > 0) {
                    setBookCompleted(true);
                  }

                  // Jump to content generation step
                  setStep('content');

                } catch (error) {
                  console.error('Error loading book:', error);
                  alert('Failed to load book');
                }

                setLoading(false);
              }}
              variant="slim"
              loading={loading}
            >
              Resume Book
            </Button>
          </div>
        </div>
      )}

      {step === 'title' && bookData && (
        <div className="space-y-4">
          <h2 className="text-xl">Generated Title:</h2>
          <div className="bg-gray-800 p-4 rounded border border-gray-600">
            <h3 className="text-lg font-bold text-white">{bookData.title}</h3>
            <p className="text-gray-300">{bookData.subtitle}</p>
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
            <p className="text-gray-400 mb-3 italic">{bookData.subtitle}</p>
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
            <p className="text-blue-100 italic text-sm">{bookData.subtitle}</p>
            <p className="text-blue-100 mt-2">
              <strong>Progress:</strong> {completedChapters.length} / {bookData.chapterTitles.length} chapters completed
            </p>
          </div>

          {!bookCompleted && currentChapter < bookData.chapterTitles.length && (
            <div className="bg-gray-800 p-4 rounded border border-gray-600">
              <h3 className="font-bold mb-2 text-white">
                Next: Chapter {currentChapter + 1}
              </h3>
              <p className="text-gray-300">{bookData.chapterTitles[currentChapter]}</p>
              <Button
                onClick={generateChapterContent}
                loading={loading}
                className="mt-3"
              >
                Generate Chapter Content
              </Button>
            </div>
          )}

          {completedChapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Completed Chapters:</h3>
              {completedChapters.map((chapter, i) => (
                <div key={i} className="border border-gray-600 p-4 rounded bg-gray-800">
                  <h4 className="font-bold text-white mb-2">
                    Chapter {chapter.chapterNumber}: {chapter.chapterTitle}
                  </h4>
                  <div className="text-sm text-gray-300 mb-3">
                    {chapter.wordCount} words |
                    {chapter.wasRevised && <span className="text-yellow-400 ml-2">📝 Revised ({chapter.attempts} attempts)</span>}
                    {!chapter.wasRevised && <span className="text-green-400 ml-2">✅ First draft accepted</span>}
                  </div>

                  {/* Content preview */}
                  <details className="mb-3">
                    <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300">
                      View Chapter Content
                    </summary>
                    <div className="bg-gray-900 p-4 rounded text-sm text-gray-200 mt-2 border border-gray-700">
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{chapter.content}</div>
                    </div>
                  </details>

                  {/* Review details */}
                  {chapter.review && (
                    <div className="bg-blue-900 p-4 rounded text-sm border border-blue-700">
                      <h5 className="font-semibold mb-2 text-blue-200">Review Analysis:</h5>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-blue-100">
                          <strong>Satire:</strong> {chapter.review.satireScore}/5
                        </div>
                        <div className="text-blue-100">
                          <strong>Variety:</strong> {chapter.review.varietyScore}/5
                        </div>
                        <div className="text-blue-100">
                          <strong>Absurdity:</strong> {chapter.review.absurdityScore}/5
                        </div>
                      </div>

                      {chapter.wasRevised && (
                        <p className="text-yellow-300 mb-2">
                          <strong>Revision Reason:</strong> {chapter.review.revisionReason}
                        </p>
                      )}

                      {chapter.review.bestLines && chapter.review.bestLines.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-green-300">🔥 Best Lines:</strong>
                          <ul className="text-sm text-green-100 mt-1 space-y-1">
                            {chapter.review.bestLines.map((line: string, j: number) => (
                              <li key={j} className="italic">"{line}"</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {bookCompleted && (
            <div className="bg-green-900 p-6 rounded border border-green-700">
              <h3 className="text-xl font-bold text-green-200 mb-3">
                🎉 Book Complete!
              </h3>
              <div className="text-green-100 space-y-2">
                <p><strong>Title:</strong> {bookData.title}</p>
                <p><strong>Subtitle:</strong> {bookData.subtitle}</p>
                <p><strong>Chapters:</strong> {bookData.chapterTitles.length}</p>
                <p><strong>Total Words:</strong> {completedChapters.reduce((sum, ch) => sum + ch.wordCount, 0).toLocaleString()}</p>
                <p><strong>Chapters Revised:</strong> {completedChapters.filter(ch => ch.wasRevised).length}</p>
                <p><strong>Total Generation Attempts:</strong> {completedChapters.reduce((sum, ch) => sum + ch.attempts, 0)}</p>
              </div>

              <div className="flex space-x-4 mt-4">
                <Button onClick={exportBook} className="bg-blue-600 hover:bg-blue-700">
                  📥 Export Book Data
                </Button>
                <Button onClick={() => window.location.reload()} variant="slim">
                  📚 Generate Another Book
                </Button>
              </div>
            </div>
          )}

          {completedChapters.length > 0 && !bookCompleted && (
            <Button onClick={regenerateLastChapter} variant="slim" className="mt-4">
              🔄 Regenerate Last Chapter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}