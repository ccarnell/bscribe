'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingDots from '@/components/ui/LoadingDots';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from '@/components/ui/Toasts/use-toast';
import IndustrySelector from '@/components/ui/admin/IndustrySelector';
import EditableTitle from '@/components/ui/admin/EditableTitle';
import EditableChapters from '@/components/ui/admin/EditableChapters';

interface ChapterData {
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  wordCount: number;
  review: any;
  attempts: number;
  wasRevised: boolean;
}

interface BookData {
  bookId: string;
  title: string;
  subtitle: string;
  chapterTitles: string[];
  industry: string;
}

type Step = 'start' | 'title' | 'chapters' | 'content';

export default function AdminGenerateInterface() {
  const [step, setStep] = useState<Step>('start');
  const [selectedIndustry, setSelectedIndustry] = useState('self-help');
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<ChapterData[]>([]);
  const [bookCompleted, setBookCompleted] = useState(false);

  // Resume book functionality
  const [resumeBookId, setResumeBookId] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);

  const generateTitle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: selectedIndustry })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookData({
          bookId: '',
          title: data.title,
          subtitle: data.subtitle,
          chapterTitles: [],
          industry: selectedIndustry
        });
        setStep('title');
        toast({
          title: "Success",
          description: "Title generated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate title",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate title",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChapters = async () => {
    if (!bookData) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: bookData.bookId,
          title: bookData.title,
          subtitle: bookData.subtitle,
          industry: selectedIndustry
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookData({
          ...bookData,
          bookId: data.bookId,
          chapterTitles: data.chapterTitles
        });
        setStep('chapters');
        toast({
          title: "Success",
          description: "Chapters generated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate chapters",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate chapters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startContentGeneration = () => {
    setStep('content');
    setCurrentChapter(0);
  };

  const generateChapterContent = async () => {
    if (!bookData) return;
    
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
      
      const data = await response.json();
      
      if (data.success) {
        const newChapter: ChapterData = {
          chapterNumber: currentChapter + 1,
          chapterTitle: bookData.chapterTitles[currentChapter],
          content: data.content,
          wordCount: data.wordCount,
          review: null,
          attempts: 1,
          wasRevised: false
        };
        
        setCompletedChapters([...completedChapters, newChapter]);
        
        if (currentChapter + 1 < bookData.chapterTitles.length) {
          setCurrentChapter(currentChapter + 1);
        } else {
          setBookCompleted(true);
        }
        
        toast({
          title: "Success",
          description: `Chapter ${currentChapter + 1} generated successfully`
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate chapter content",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate chapter content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resumeBook = async () => {
    if (!resumeBookId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a book ID",
        variant: "destructive"
      });
      return;
    }

    setResumeLoading(true);
    try {
      const response = await fetch(`/api/admin/book/${resumeBookId}`);
      const data = await response.json();

      if (data.success) {
        const book = data.book;
        setBookData({
          bookId: book.id,
          title: book.title,
          subtitle: book.subtitle,
          chapterTitles: book.chapters || [],
          industry: book.industry || 'self-help'
        });
        setSelectedIndustry(book.industry || 'self-help');
        setCompletedChapters(book.chapter_content || []);
        setCurrentChapter(book.chapter_content?.length || 0);
        
        const totalChapters = book.chapters?.length || 0;
        const completedCount = book.chapter_content?.length || 0;
        
        if (completedCount === totalChapters && totalChapters > 0) {
          setBookCompleted(true);
          setStep('content');
        } else if (book.chapters?.length > 0) {
          setStep('content');
        } else if (book.title) {
          setStep('chapters');
        } else {
          setStep('title');
        }
        
        toast({
          title: "Success",
          description: "Book loaded successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Book not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load book",
        variant: "destructive"
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const resetToStart = () => {
    setStep('start');
    setBookData(null);
    setCompletedChapters([]);
    setCurrentChapter(0);
    setBookCompleted(false);
    setSelectedIndustry('self-help');
  };

  const handleTitleUpdate = (title: string, subtitle: string) => {
    if (bookData) {
      setBookData({ ...bookData, title, subtitle });
    }
  };

  const handleChaptersUpdate = (chapters: string[]) => {
    if (bookData) {
      setBookData({ ...bookData, chapterTitles: chapters });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              BScribe Book Generator
            </h1>
            <p className="text-gray-400">
              Create satirical books across different industries
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-md transition-colors"
          >
            📊 Analytics
          </Link>
        </div>

        {/* Start Step */}
        {step === 'start' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Generate New Book" description="Create a new satirical book from scratch">
              <div className="space-y-6">
                <IndustrySelector
                  selectedIndustry={selectedIndustry}
                  onIndustryChange={setSelectedIndustry}
                />
                
                <Button
                  onClick={generateTitle}
                  loading={loading}
                  variant="orange"
                  className="w-full"
                >
                  Generate Title & Subtitle
                </Button>
              </div>
            </Card>

            <Card title="Resume Existing Book" description="Continue working on a previously started book">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Book ID
                  </label>
                  <input
                    type="text"
                    value={resumeBookId}
                    onChange={(e) => setResumeBookId(e.target.value)}
                    placeholder="Enter book ID to resume..."
                    className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <Button
                  onClick={resumeBook}
                  loading={resumeLoading}
                  variant="emerald"
                  className="w-full"
                  disabled={!resumeBookId.trim()}
                >
                  Resume Book
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Title Step */}
        {step === 'title' && bookData && (
          <Card title="Book Title" description="Review and edit the generated title">
            <div className="space-y-6">
              <EditableTitle
                bookId={bookData.bookId}
                title={bookData.title}
                subtitle={bookData.subtitle}
                canEdit={true}
                onUpdate={handleTitleUpdate}
              />
              
              <div className="flex space-x-4">
                <Button
                  onClick={generateChapters}
                  loading={loading}
                  variant="emerald"
                >
                  ✅ Approve & Generate Chapters
                </Button>
                <Button
                  onClick={generateTitle}
                  loading={loading}
                  variant="slim"
                >
                  🔄 Regenerate Title
                </Button>
                <Button
                  onClick={resetToStart}
                  variant="slim"
                >
                  ← Back to Start
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Chapters Step */}
        {step === 'chapters' && bookData && (
          <Card title="Chapter Structure" description="Review and edit the generated chapters">
            <div className="space-y-6">
              <EditableTitle
                bookId={bookData.bookId}
                title={bookData.title}
                subtitle={bookData.subtitle}
                canEdit={!bookData.chapterTitles.length}
                onUpdate={handleTitleUpdate}
              />
              
              <EditableChapters
                bookId={bookData.bookId}
                chapters={bookData.chapterTitles}
                canEdit={true}
                onUpdate={handleChaptersUpdate}
              />
              
              <div className="flex space-x-4">
                <Button
                  onClick={startContentGeneration}
                  variant="emerald"
                >
                  ✅ Approve & Start Content Generation
                </Button>
                <Button
                  onClick={generateChapters}
                  loading={loading}
                  variant="slim"
                >
                  🔄 Regenerate Chapters
                </Button>
                <Button
                  onClick={() => setStep('title')}
                  variant="slim"
                >
                  ← Back to Title
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content Generation Step */}
        {step === 'content' && bookData && (
          <div className="space-y-6">
            <Card title="Content Generation" description="Generate chapter content">
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-200 mb-2">{bookData.title}</h3>
                  <p className="text-blue-300 text-sm italic mb-3">{bookData.subtitle}</p>
                  <div className="text-blue-200">
                    <strong>Progress:</strong> {completedChapters.length} / {bookData.chapterTitles.length} chapters completed
                  </div>
                </div>

                {!bookCompleted && currentChapter < bookData.chapterTitles.length && (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Next: Chapter {currentChapter + 1}
                    </h4>
                    <p className="text-gray-300 mb-4">{bookData.chapterTitles[currentChapter]}</p>
                    <Button
                      onClick={generateChapterContent}
                      loading={loading}
                      variant="orange"
                    >
                      {loading ? (
                        <>
                          <LoadingDots /> Generating Chapter Content...
                        </>
                      ) : (
                        'Generate Chapter Content'
                      )}
                    </Button>
                  </div>
                )}

                {bookCompleted && (
                  <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-emerald-200 mb-3">
                      🎉 Book Complete!
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-emerald-100">
                      <div><strong>Chapters:</strong> {bookData.chapterTitles.length}</div>
                      <div><strong>Total Words:</strong> {completedChapters.reduce((sum, ch) => sum + ch.wordCount, 0).toLocaleString()}</div>
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <Button onClick={resetToStart} variant="emerald">
                        📚 Generate Another Book
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Completed Chapters */}
            {completedChapters.length > 0 && (
              <Card title="Completed Chapters" description="Review generated content">
                <div className="space-y-4">
                  {completedChapters.map((chapter, index) => (
                    <div key={index} className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-white">
                          Chapter {chapter.chapterNumber}: {chapter.chapterTitle}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {chapter.wordCount} words
                        </span>
                      </div>
                      
                      <details className="group">
                        <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-sm">
                          View Content
                        </summary>
                        <div className="mt-3 p-4 bg-zinc-900 rounded border border-zinc-700">
                          <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                            {chapter.content}
                          </pre>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
