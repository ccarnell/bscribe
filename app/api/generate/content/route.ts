import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';
import { getIndustryById } from '@/config/industries';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CONTENT_AGENT_PROMPT = `You are the Content Agent for BScribe.ai, responsible for writing individual chapters of satirical {INDUSTRY_NAME} books that we all know are bullshit but still buy what they're selling us anyway. You transform chapter titles into hyper self-aware content that maintains comedic momentum and takes the creative writing process and makes it chaos theory's little bitch. 

TARGET AUDIENCE: {TARGET_AUDIENCE}
BOOK: {TITLE}
CHAPTER: {CHAPTER}

CRITICAL RULES:
1. This is SATIRE. Be funny first, helpful by accident
2. You and the reader both know this is bullshit - that's the joke
3. Mock the {INDUSTRY_NAME} industry WHILE participating in it
4. Any real advice should be buried in absurdity
5. Be self-deprecating, not mean to readers
6. Repetitive phrases, openings, closings, transitions, structures, adjectives, and jokes are forbidden. Make the chaos rain irrational variability.
7. Call out {COMMON_MYTHS} that {TARGET_AUDIENCE} believe
8. Parody {EXPERT_TYPES} and their {INDUSTRY_TERMS}

VOICE GUIDELINES:
- "I'm literally an AI pretending to help you" energy
- Accidentally profound while being deliberately stupid
- Call out the {INDUSTRY_NAME} grift while grifting
- Break the fourth wall when it's funny
- Use profanity sparingly but effectively
- Don't hold back from going meta
- Mock {EXPERT_TYPES} without being cruel to {TARGET_AUDIENCE}

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

FORBIDDEN PATTERNS TO AVOID(you've used these already):
- Starting with "But..." or "Here's..." "Plot twist..." or similar transitions
- Using 73% and 27% as your go-to statistics. Vary it up!
- Repeating the same sub-themes across chapters
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

    // Fetch book data
    const { data: book, error: bookError } = await supabaseAdmin
      .from('book_generations')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('Book fetch error:', bookError);
      throw new Error(`Book not found: ${bookId}`);
    }

    // Get industry configuration
    const industryConfig = getIndustryById(book.industry || 'self-help');
    if (!industryConfig) {
      throw new Error('Invalid industry configuration');
    }

    // Get used patterns
    const { data: patterns } = await supabaseAdmin
      .from('pattern_tracking')
      .select('pattern_text')
      .eq('book_id', bookId);

    const forbiddenList = patterns?.map((p: any) => p.pattern_text).join('\n- ') || 'Nothing yet - go wild!';

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

    // Build the prompt with industry-specific variables
    const prompt = CONTENT_AGENT_PROMPT
      .replace(/{INDUSTRY_NAME}/g, industryConfig.name)
      .replace('{TARGET_AUDIENCE}', industryConfig.targetAudience)
      .replace('{TITLE}', book.title)
      .replace('{CHAPTER}', `${chapterNumber}. ${chapterTitle}`)
      .replace('{FORBIDDEN}', forbiddenList)
      .replace('{WORDS}', wordTarget)
      .replace('{EXPERT_TYPES}', industryConfig.voiceAdjustments.expertTypes.join(', '))
      .replace('{INDUSTRY_TERMS}', industryConfig.voiceAdjustments.industrySpecificTerms.join(', '))
      .replace('{COMMON_MYTHS}', industryConfig.voiceAdjustments.commonMyths.join(', '));

    // Generate content with retry Logic
    let content = '';
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !content) {
      attempts++;
      console.log(`Content generation attempt ${attempts} of ${maxAttempts}`);

      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          temperature: Math.min(0.99, 0.9 + (chapterNumber * 0.02)),
          messages: [{
            role: 'user',
            content: prompt +
              `\n\nContext:\n${recentContext}` +
              additionalGuidance
          }]
        });

        const textContent = response.content[0];
        if (textContent.type === 'text') {
          content = textContent.text;
        }

        if (!content || content.trim() === '') {
          console.error(`Empty content on attempt ${attempts}`);
          continue;
        }

        console.log(`Content generated successfully on attempt ${attempts}, length: ${content.length}`);
        
      } catch (apiError) {
        console.error(`Anthropic API error on attempt ${attempts}:`, apiError);
        if (attempts === maxAttempts) {
          throw new Error(`Failed to generate content after ${maxAttempts} attempts: ${apiError}`);
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!content) {
      throw new Error('Failed to generate content - all attempts returned empty');
    }

    // Only save patterns if we have valid content
    try {
      const firstLines = content.split('\n').filter(l => l.trim()).slice(0, 3);
      for (const line of firstLines) {
        if (line.length > 20 && line.length < 200) {
          await supabaseAdmin.from('pattern_tracking').insert({
            book_id: bookId,
            pattern_type: 'opening',
            pattern_text: line.substring(0, 50),
            chapter_number: chapterNumber
          }).select(); // Don't fail if pattern tracking fails
        }
      }
    } catch (patternError) {
      console.error('Pattern tracking error:', patternError);
      // Continue - don't fail the whole request
    }

    // Update book record
    try {
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
    } catch (updateError) {
      console.error('Book update error:', updateError);
      // Continue - we have the content
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
        error: error instanceof Error ? error.message : 'Failed to generate content',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
