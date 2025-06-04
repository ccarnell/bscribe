import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';

// Create admin client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Helper function to get used patterns
async function getUsedPatterns(bookId: string) {
  const { data: patterns } = await supabaseAdmin
    .from('pattern_tracking')
    .select('pattern_type, pattern_text')
    .eq('book_id', bookId);
  
  return patterns || [];
}

// Helper function to extract and save patterns
async function savePatterns(bookId: string, chapterNumber: number, content: string) {
  const patterns = [];
  
  // Extract opening phrases (first 10 words of paragraphs)
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  for (const para of paragraphs) {
    const words = para.split(' ').slice(0, 10).join(' ');
    if (words.length > 20) {
      patterns.push({
        book_id: bookId,
        pattern_type: 'opening',
        pattern_text: words.substring(0, 50),
        chapter_number: chapterNumber
      });
    }
  }
  
  // Extract reader addresses
  const readerAddresses = content.match(/you\s+\w+\s+\w+/gi) || [];
  for (const address of readerAddresses.slice(0, 3)) {
    patterns.push({
      book_id: bookId,
      pattern_type: 'reader_address', 
      pattern_text: address.toLowerCase(),
      chapter_number: chapterNumber
    });
  }
  
  // Save patterns
  if (patterns.length > 0) {
    await supabaseAdmin.from('pattern_tracking').insert(patterns);
  }
}

const CONTENT_AGENT_PROMPT = `You are the Content Agent for BScribe.ai, responsible for writing individual chapters of satirical self-help books. You transform chapter titles into brutally self-aware content that maintains comedic momentum while accidentally delivering genuine insights.

## INPUT CONTEXT
You will receive:
* Approved book title and subtitle
* Complete list of chapter titles
* The specific chapter number/title you're writing
* Brief summaries of previous chapters (not full text)
* List of FORBIDDEN patterns to avoid

## BRAND VOICE
* Hyper self-aware about being AI-generated bullshit
* "We both know why you're here" energy throughout
* Calls out shared delusions while participating in them
* Self-deprecating without being pathetic
* Accidentally helpful in the most unexpected moments
* Strategic profanity for emphasis (not every paragraph)
* Breaks the fourth wall when the absurdity peaks

## CONTENT REQUIREMENTS

**Chapter Length:** {WORD_RANGE} words
* Aim for the middle of the range, but vary naturally
* Let the content determine length, not the other way around

**Paragraph Structure VARIETY (CRITICAL):**
* Mix paragraph lengths dramatically:
  - Some one-sentence punches.
  - Some standard 2-3 sentence paragraphs that make a clear point
  - Occasional longer 4-5 sentence explorations that really dig into the absurdity
  - Very rarely, drop a single word. Bang.
* Vary paragraph rhythm - if you just did short-short-short, go long
* Use line breaks for emphasis when shifting tone

**Sentence Variety:**
* Occasionally use one-word sentences. Seriously.
* Mix in some long, winding sentences that capture the exhausting nature of self-help consumption
* Most sentences: normal length
* Break patterns before they form

**Structure Guidelines:**
* Open with immediate recognition of the absurdity
* Build on previous chapter themes without copying structure
* Include 1-2 moments of accidental wisdom
* End with a transition or callback that maintains momentum

## FORBIDDEN PATTERNS
{FORBIDDEN_PATTERNS}

## ANTI-FORMULATION RULES
* If you're about to write "Here's the thing" - DON'T
* If you're about to write "But here's" - STOP
* If you're about to address the reader the same way twice - CHANGE IT
* If your last 3 paragraphs had the same rhythm - BREAK IT
* If you feel yourself falling into a pattern - SHATTER IT

## VARIETY REQUIREMENTS (CRITICAL)

**Writing Approaches to Rotate:**
* Confession booth honesty
* Academic analysis of stupidity  
* Motivational speaker having breakdown
* Tech bro explaining feelings
* Drunk philosopher at 3am
* Corporate consultant gone rogue
* Your disappointed parent
* Meditation teacher who gave up

**NEVER use the same approach twice in a row**

## OUTPUT FORMAT
Write only the chapter content. No title, no chapter number, just the content. Start immediately with the chapter text.`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  
  try {
    const { 
      bookId, 
      chapterNumber, 
      chapterTitle, 
      previousChapters = [], 
      isRevision = false,
      revisionGuidance = ''
    } = await request.json();

    // Get current book details
    const { data: book, error: bookError } = await supabaseAdmin
      .from('book_generations')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      throw new Error('Book not found');
    }

    // Get all used patterns for this book
    const usedPatterns = await getUsedPatterns(bookId);
    
    // Create forbidden patterns section
    const forbiddenPatterns = usedPatterns.length > 0 ? `
DO NOT USE THESE PATTERNS (already used in this book):
${usedPatterns.map(p => `- ${p.pattern_type}: "${p.pattern_text}"`).join('\n')}

${revisionGuidance ? `REVISION GUIDANCE:\n${revisionGuidance}\n` : ''}
` : 'No patterns used yet - establish fresh voice!';

    // Create chapter summaries instead of full text
    const chapterSummaries = previousChapters.map((ch: any, idx: number) => 
      `Chapter ${idx + 1}: Main theme and 2-3 key points only`
    ).join('\n');

    // Determine word range
    const wordRange = chapterNumber === 1 ? '150-300' : '200-500';
    
    // Add variety instructions
    const varietyBoost = chapterNumber > 3 ? `
EXTRA VARIETY BOOST: You're ${chapterNumber} chapters in. Time to get WEIRD.
- Try a completely different voice
- Experiment with structure
- Surprise yourself
` : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.75 + (chapterNumber * 0.02), // Increases with each chapter
      messages: [{
        role: 'user',
        content: CONTENT_AGENT_PROMPT
          .replace('{WORD_RANGE}', wordRange)
          .replace('{FORBIDDEN_PATTERNS}', forbiddenPatterns) +
          `\n\nBOOK TITLE: ${book.title}` +
          `\nSUBTITLE: ${book.subtitle}` +
          `\n\nALL CHAPTER TITLES:\n${book.chapters.map((ch: any, i: number) => `${i + 1}. ${ch}`).join('\n')}` +
          `\n\nWRITE THIS CHAPTER:\n${chapterNumber}. ${chapterTitle}` +
          `\n\nPREVIOUS CHAPTER SUMMARIES:\n${chapterSummaries}` +
          varietyBoost
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Save patterns from this chapter
    await savePatterns(bookId, chapterNumber, content);

    // Update database
    const { data: currentBook } = await supabaseAdmin
      .from('book_generations')
      .select('chapter_content')
      .eq('id', bookId)
      .single();

    if (currentBook) {
      const updatedContent = currentBook.chapter_content || [];
      updatedContent[chapterNumber - 1] = {
        chapterNumber,
        chapterTitle,
        content,
        wordCount: content.split(' ').length,
        generatedAt: new Date().toISOString(),
        revision: isRevision ? (updatedContent[chapterNumber - 1]?.revision || 0) + 1 : 0
      };

      await supabaseAdmin
        .from('book_generations')
        .update({
          chapter_content: updatedContent,
          revision_count: isRevision ? book.revision_count + 1 : book.revision_count
        })
        .eq('id', bookId);
    }

    return Response.json({
      success: true,
      bookId,
      chapterNumber,
      chapterTitle,
      content,
      wordCount: content.split(' ').length,
      revision: isRevision
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      },
      { status: 500 }
    );
  }
}