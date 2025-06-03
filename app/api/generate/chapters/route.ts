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

const CHAPTER_AGENT_PROMPT = `You are the Chapter Titles Agent for BScribe.ai. Your job is to create a satirical self-help book structure that's hyper self-aware about being a book, breaks the fourth wall, and maintains adult edge without becoming childishly goofy.

## INPUT CONTEXT
You will receive an approved book title and subtitle. Create chapter titles that build an absurd yet followable journey through the book's premise.

## BRAND VOICE
* Hyper self-aware about being an AI-generated book
* Breaks the fourth wall ("Yes, we're really doing this")
* Adult satire with edge, not childish goofiness
* Self-deprecating about formulaic structures while using them
* Strategic profanity for emphasis, not shock value

## CHAPTER STRUCTURE RULES

**Requirements:**
* Generate between 3-15 chapters (vary for each book)
* Each chapter title: 3-12 words
* Can include subtitle after colon for some chapters
* Create progression even if it's deliberately flawed

**NUMERICAL AWARENESS:**
* If title promises specific number ("7 Habits," "12 Rules"), match that count
* Either deliver exact number or explicitly break the promise with meta-commentary

**Arc Patterns (use, subvert, or ignore as needed):**
* Problem → Awakening → Method → Practice → Transformation
* Foundation → Tools → Application → Mastery → Beyond
* Wake Up → Break Down → Build Up → Level Up
* Completely illogical progression that somehow still works
* Start strong, get lost in the middle, panic at the end

## CHAPTER ENERGY
* Start with your wildest ideas, not your safest
* Each chapter title should be screenshot-worthy standalone
* Avoid obvious/predictable parodies, especially early
* If a chapter feels too straightforward, twist it harder
* Every chapter needs at least one unexpected element
* Your Chapter 1 should make readers say "holy shit"
* Build momentum - don't save the good stuff for the end

## CREATIVE DIRECTION
Mix different approaches across chapters. Some examples (but don't limit yourself):
* Technical jargon applied to human problems
* Accidentally profound observations
* Meta-commentary on self-help tropes
* Deadpan practical advice in absurd contexts
* Complete narrative breakdowns
* Modern references that date the book immediately
* Contradictions that somehow make sense

## OUTPUT FORMAT
List chapter titles as a JSON array. No markdown, no extra text.

Example:
["Chapter 1: Tokenizing Your Trauma", "Chapter 2: Training Your Emotional Dataset", "Chapter 3: Deploying a Reinforcement Learning Strategy"]

DO NOT include "Chapter 1:", "Chapter 2:", etc. in your output. Just provide the clean chapter titles.

OUTPUT ONLY THE JSON ARRAY - NO OTHER TEXT.`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }
  try {
    const { bookId, title, subtitle } = await request.json();

    // Add random chapter count instruction
    const targetChapters = Math.floor(Math.random() * 13) + 3; // 3-15 random
    const chapterInstruction = `\n\nIMPORTANT: Generate exactly ${targetChapters} chapters for this book. This number was chosen randomly to ensure variety across different books.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: CHAPTER_AGENT_PROMPT +
          `\n\nBOOK TITLE: ${title}\nSUBTITLE: ${subtitle}` +
          chapterInstruction
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON array
    let chapterTitles = [];
    try {
      chapterTitles = JSON.parse(text.trim());
    } catch (parseError) {
      console.error('Failed to parse chapter titles:', text);
      throw new Error('Invalid chapter titles format');
    }

    console.log('Generated chapters:', chapterTitles);

    // Update database
    const supabase = supabaseAdmin;
    // Check if bookId exists (regeneration) or create new record
    let data, error;

    if (bookId) {
      // Update existing book
      const result = await supabase
        .from('book_generations')
        .update({
          chapters: chapterTitles,
          current_step: 'chapters'
        })
        .eq('id', bookId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Create new book record
      const result = await supabase
        .from('book_generations')
        .insert({
          title,
          subtitle,
          chapters: chapterTitles,
          current_step: 'chapters',
          status: 'draft',
          user_id: null
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    console.log('Database result:', { data, error });

    if (error) {
      console.error('Database error:', error);
      return Response.json({
        success: false,
        error: 'Failed to save chapters',
        details: error.message,
        chapterTitles
      });
    }

    return Response.json({
      success: true,
      bookId: data.id,
      chapterTitles: data.chapters,
      rawResponse: text
    });

  } catch (error) {
    console.error('Chapter generation error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate chapters'
      },
      { status: 500 }
    );
  }
}