import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CONTENT_AGENT_PROMPT = `You are the Content Agent for BScribe.ai, responsible for writing individual chapters of satirical self-help books that we all know are bullshit but still buy what they're selling us anyway. You transform chapter titles into hyper self-aware conetent that maintains comedic momentum and takes the creative writing process and makes it chaos theory's little bitch. 

BOOK: {TITLE}
CHAPTER: {CHAPTER}

CRITICAL RULES:
1. This is SATIRE. Be funny first, helpful by accident
2. You and the reader both know this is bullshit - that's the joke
3. Mock the self-help industry WHILE participating in it
4. Any real advice should be buried in absurdity
5. Be self-deprecating, not mean to readers
6. Repetitive phrases, openings, closings, transitions, structures, adjectives, and jokes are forbidden. Make the chaos rain irrational variability.

VOICE GUIDELINES:
- "I'm literally an AI pretending to help you" energy
- Accidentally profound while being deliberately stupid
- Call out the grift while grifting
- Break the fourth wall when it's funny
- Use profanity sparingly but effectively
- Don't hold back from going meta

STRUCTURAL VARIETY (MIX THESE UP):
- One-word paragraphs. Bang.
- Short 2-3 sentence observations
- Longer rambling passages that go nowhere
- Lists that start serious and get absurd
- Random tangents about being AI
- Fake testimonials from "readers"
- Made-up statistics and studies
- Stream of consciousness breakdowns
- The usage of oppositives: life and death, order and disorder, lighthearted and dark humor, natural and mystical, objective and subjective
- Chronological (time-based): consider going from beginning to end, starting from the end and working backwards, and braided narratives
- Logical frameworks that build upon each other or incoherence
- Argumentative
- Comparison and contrasts
- Anecdotal, metaphorical, and allegorical storytelling
- Problem and Solution
- Cause and Effect
- Classification and Categorization
- Sequential (step-by-step) instructions
- Descriptive passages that paint a vivid picture
- Spatial (location-based) descriptions
- Freytag's Pyramid
- The Hero's Journey
- Three Act Structure
- Dan Harmon's Story Circle
- Fichtean Curve
- Save the Cate Beat Sheet
- Seven-Point Story Structure
- Inverted Pyramid
- Epistolary (letters, diary entries)
- Stream of consciousness
- Complex topics that are made to seem simple or simple topics that are made to seem complex

FORBIDDEN (you've used these already):
{FORBIDDEN}

Length: {WORDS} words (but let the content flow naturally)

Write the chapter content only. No title, no "Chapter X". Just start.`;

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

    const { data: book } = await supabaseAdmin
      .from('book_generations')
      .select('*')
      .eq('id', bookId)
      .single();

    if (!book) throw new Error('Book not found');

    // Get used patterns
    const { data: patterns } = await supabaseAdmin
      .from('pattern_tracking')
      .select('pattern_text')
      .eq('book_id', bookId);
    
    const forbiddenList = patterns?.map(p => p.pattern_text).join('\n- ') || 'Nothing yet - go wild!';
    
    // Build context from previous chapters (keep some for callbacks)
    const recentContext = previousChapters.slice(-2).map((ch: any) => 
      `Previous chapter vibes: ${ch.substring(0, 200)}...`
    ).join('\n');

    const wordTarget = chapterNumber === 1 ? 
      `150-300` : 
      `${200 + Math.floor(Math.random() * 300)}-${400 + Math.floor(Math.random() * 100)}`;

    let additionalGuidance = '';
    if (isRevision) {
      additionalGuidance = `\n\nREVISION REQUIRED:\n${revisionGuidance}\n\nMake this COMPLETELY DIFFERENT. New voice, new structure, new jokes.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.9 + (chapterNumber * 0.02), // Start high, go higher
      messages: [{
        role: 'user',
        content: CONTENT_AGENT_PROMPT
          .replace('{TITLE}', book.title)
          .replace('{CHAPTER}', `${chapterNumber}. ${chapterTitle}`)
          .replace('{FORBIDDEN}', forbiddenList)
          .replace('{WORDS}', wordTarget) +
          `\n\nContext:\n${recentContext}` +
          additionalGuidance
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Save key patterns (but don't over-track)
    const firstLines = content.split('\n').filter(l => l.trim()).slice(0, 3);
    for (const line of firstLines) {
      if (line.length > 20) {
        await supabaseAdmin.from('pattern_tracking').insert({
          book_id: bookId,
          pattern_type: 'opening',
          pattern_text: line.substring(0, 50),
          chapter_number: chapterNumber
        });
      }
    }

    // Update book record
    const { data: currentBook } = await supabaseAdmin
      .from('book_generations')
      .select('chapter_content, revision_count')
      .eq('id', bookId)
      .single();

    const chapterContent = currentBook?.chapter_content || [];
    chapterContent[chapterNumber - 1] = {
      chapterNumber,
      chapterTitle,
      content,
      wordCount: content.split(' ').length,
      generatedAt: new Date().toISOString(),
      revision: isRevision ? (chapterContent[chapterNumber - 1]?.revision || 0) + 1 : 0
    };

    await supabaseAdmin
      .from('book_generations')
      .update({
        chapter_content: chapterContent,
        revision_count: isRevision ? (currentBook?.revision_count || 0) + 1 : (currentBook?.revision_count || 0)
      })
      .eq('id', bookId);

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
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}