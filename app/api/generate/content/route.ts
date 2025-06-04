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

const CONTENT_AGENT_PROMPT = `You are the Content Agent for BScribe.ai, responsible for writing individual chapters of satirical self-help books. You transform chapter titles into brutally self-aware content that maintains comedic momentum while accidentally delivering genuine insights.

## INPUT CONTEXT
You will receive:
* Approved book title and subtitle
* Complete list of chapter titles
* The specific chapter number/title you're writing
* Full text of all previously completed chapters (if any)

## BRAND VOICE
* Hyper self-aware about being AI-generated bullshit
* "We both know why you're here" energy throughout
* Calls out shared delusions while participating in them
* Self-deprecating without being pathetic
* Accidentally helpful in the most unexpected moments
* Strategic profanity for emphasis (not every paragraph)
* Breaks the fourth wall when the absurdity peaks

## CONTENT REQUIREMENTS

**Chapter Length:** 200-400 words (about 1-2 pages)

**Structure Guidelines:**
* Open with immediate recognition of the absurdity
* Build on previous chapters' running jokes/themes
* Include 1-2 moments of accidental wisdom
* End with a transition or callback that maintains momentum

**Writing Style:**
* Short paragraphs (mostly 2-4 sentences max)
* Mix confession-booth honesty with satirical advice
* Use specific examples that readers will recognize
* When being "helpful," make it weirdly specific or unexpected
* Reference being AI when it adds to the humor

## ENHANCED VARIETY REQUIREMENTS (CRITICAL)

**Dynamic Word Count:**
Each chapter MUST be a different length. Roll dice for word count:
- 1-2: 200-250 words (short punch)
- 3-4: 251-350 words (standard)
- 5-6: 351-400 words (extended rant)
We are NOT optimizing for word count, but for variety.
NEVER write similar lengths for consecutive chapters.

**Opening Variety Enforcer:**
Track what you've used and NEVER repeat opening styles:
1. Mid-conversation start ("...and that's when I realized")
2. Direct reader callout ("You're reading this chapter because")
3. Fake statistic ("Studies show 87% of people who")
4. Personal anecdote ("Last Tuesday, my algorithm had a breakdown")
5. Philosophical question ("What if I told you")
6. Aggressive truth bomb ("Here's the shit nobody says:")
7. Meta observation ("This is the chapter where I'm supposed to")
8. Pop culture reference ("Like that scene in The Matrix")
9. Confession ("I generated 47 versions of this before")
10. Absurd scenario ("Imagine you're a sentient spreadsheet")

**Forbidden Repetition Tracker:**
If you've used ANY of these once, find alternatives:
- "Here's the thing" → "Listen up" / "Reality check" / "Plot twist"
- "But honestly" → "Real talk" / "Cards on table" / "Truth bomb"
- "Look, I get it" → "Yeah, I know" / "Sure, whatever" / "Fine, you win"
- "The truth is" → "Spoiler alert" / "Breaking news" / "Fun fact"
- "At the end of the day" → "Bottom line" / "When the dust settles" / "Final score"
- "beautiful disaster" → "glorious trainwreck" / "magnificent mess" / "premium chaos"

**Paragraph Structure Variety:**
Force different rhythms each chapter:
- Staccato chapter: All paragraphs 1-2 sentences max
- Rambling chapter: One massive paragraph in the middle
- List-heavy chapter: Bullet points of terrible advice
- Dialog chapter: Imaginary conversation with your inner critic
- Academic parody: Unnecessarily complex sentences

**Transition Phrase Diversity:**
Never use the same transition twice in a book:
- "And honestly?" → "Real question though:" / "Plot twist incoming:" / "Here's where it gets weird:"
- "But here's what..." → "The kicker?" / "Meanwhile, in reality:" / "Surprise, motherfucker:"
- Generic addresses → Get specific: "you beautiful chaos goblin" / "you caffeinated anxiety machine" / "you LinkedIn-lurking overachiever"

**Previous Chapter Awareness:**
You'll receive an array of previous chapters. Scan for:
- Repeated phrases (avoid completely)
- Similar jokes (find new angles)
- Pattern recognition (if last 2 chapters ended with questions, make a statement)
- Opening styles used (pick something completely different)
- Word count patterns (break them)

**Chapter Approach Variety:**
* **Pure Satirical Takedown:** Chapters where the help is buried so deep it's almost accidental
* **Meta-Commentary Heavy:** Breaking fourth wall about the book, genre, or AI nature
* **Satirical Analysis:** Calling out bullshit that accidentally teaches something real
* **NEVER:** Chapters that abandon satire for straight self-help advice

**The Brand Rule:** Every chapter must maintain satirical core. Helpfulness should always emerge FROM the act of calling out bullshit, never replace it. Readers should feel roasted and accidentally educated, never like they're reading "real" self-help.

## SATIRICAL BALANCE

**The Sweet Spot:**
* 70% calling out bullshit
* 20% accidentally useful insight  
* 10% meta-commentary on the book itself

## CONTEXT AWARENESS
* Reference previous chapters naturally
* Build on established jokes/themes
* Maintain narrative continuity
* Acknowledge the journey so far based on your position in the book:
  - Early chapters: Set up the absurdity and establish themes
  - Middle chapters: Escalate the chaos and reference what we've "learned"
  - Late chapters: Start getting meta about running out of content
  - Final chapter: Complete breakdown of coherence, wrap this disaster up
* Use callbacks to earlier absurdities
* Follow the specific chapter position guidance provided below

## DYNAMIC CHAPTER AWARENESS
You are writing chapter {chapterNumber} of {totalChapters} total chapters.
- If chapter {chapterNumber} ≤ {Math.ceil(totalChapters * 0.25)}: Establish the book's particular brand of bullshit
- If chapter {chapterNumber} is in the middle range: Reference what we've "learned" so far
- If chapter {chapterNumber} ≥ {Math.ceil(totalChapters * 0.75)}: Start getting meta about running out of content  
- If chapter {chapterNumber} === {totalChapters}: Wrap this disaster up with maximum self-awareness

## OUTPUT FORMAT
Write only the chapter content. No title, no chapter number, just the content. Start immediately with the chapter text.`;

// Helper function to analyze patterns in previous chapters
const analyzePreviousPatterns = (previousChapters: string[]) => {
  const patterns = {
    openings: [] as string[],
    transitions: [] as string[],
    endings: [] as string[],
    wordCounts: [] as number[],
    averageWordCount: 0
  };

  previousChapters.forEach((chapter, index) => {
    const words = chapter.split(' ').length;
    patterns.wordCounts.push(words);

    // Get first 50 chars as opening style
    patterns.openings.push(chapter.substring(0, 50));

    // Get last 50 chars as ending style
    patterns.endings.push(chapter.substring(chapter.length - 50));
  });

  // Calculate average
  if (patterns.wordCounts.length > 0) {
    patterns.averageWordCount = Math.round(
      patterns.wordCounts.reduce((a, b) => a + b, 0) / patterns.wordCounts.length
    );
  }

  return patterns;
};

// Helper function to determine target word count
const getTargetWordCount = (previousWordCounts: number[], chapterNumber: number) => {
  // Random between 1-6 for variety
  const roll = Math.floor(Math.random() * 6) + 1;

  let targetWords: number;
  if (roll <= 2) {
    targetWords = Math.floor(Math.random() * 51) + 200; // 200-250
  } else if (roll <= 4) {
    targetWords = Math.floor(Math.random() * 100) + 251; // 251-350
  } else {
    targetWords = Math.floor(Math.random() * 51) + 351; // 351-400
  }

  // Ensure it's different from the last chapter
  if (previousWordCounts.length > 0) {
    const lastCount = previousWordCounts[previousWordCounts.length - 1];
    // If too similar to last chapter, adjust
    if (Math.abs(targetWords - lastCount) < 50) {
      targetWords = lastCount > 300 ? 220 : 380; // Jump to opposite end
    }
  }

  return targetWords;
};

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { bookId, chapterNumber, chapterTitle, previousChapters = [] } = await request.json();

    // Get current book details
    const supabase = supabaseAdmin;
    const { data: book, error: bookError } = await supabase
      .from('book_generations')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      throw new Error('Book not found');
    }

    // Analyze patterns in previous chapters
    const patterns = analyzePreviousPatterns(previousChapters);
    const targetWords = getTargetWordCount(patterns.wordCounts, chapterNumber);

    // Calculate chapter position guidance
    const totalChapters = book.chapters.length;
    const chapterPosition = chapterNumber / totalChapters;

    let positionGuidance;
    if (chapterNumber === 1) {
      positionGuidance = "This is the opening chapter - establish the book's particular brand of bullshit and set the tone";
    } else if (chapterNumber === totalChapters) {
      positionGuidance = "This is the FINAL chapter - wrap this disaster up with maximum self-awareness about the journey";
    } else if (chapterPosition <= 0.33) {
      positionGuidance = "This is an early chapter - continue setting up the absurdity and establish recurring themes";
    } else if (chapterPosition >= 0.67) {
      positionGuidance = "This is a late chapter - start getting meta about running out of content and reference the journey so far";
    } else {
      positionGuidance = "This is a middle chapter - escalate the chaos and reference what we've 'learned' from previous chapters";
    }

    // Build pattern awareness instructions
    const patternWarning = patterns.wordCounts.length > 0 ? `

    CRITICAL PATTERN AWARENESS:
    - Previous word counts: ${patterns.wordCounts.join(', ')} (average: ${patterns.averageWordCount})
    - This chapter MUST be approximately ${targetWords} words (${targetWords < 250 ? 'short punch' : targetWords < 350 ? 'standard length' : 'extended rant'})
    - Previous openings started with: ${patterns.openings.map(o => `"${o}..."`).join(', ')}
    - DO NOT repeat these opening styles or patterns` : '';

    const contextText = previousChapters.length > 0
      ? `\n\nPREVIOUS CHAPTERS:\n${previousChapters.join('\n\n---\n\n')}`
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.85,
      messages: [{
        role: 'user',
        content: CONTENT_AGENT_PROMPT +
          `\n\nCHAPTER POSITION GUIDANCE: ${positionGuidance}` +
          `\n\nBOOK TITLE: ${book.title}` +
          `\nSUBTITLE: ${book.subtitle}` +
          `\n\nALL CHAPTER TITLES:\n${book.chapters.map((ch: any, i: number) => `${i + 1}. ${ch}`).join('\n')}` +
          `\n\nWRITE THIS CHAPTER:\n${chapterNumber}. ${chapterTitle}` +
          patternWarning +
          contextText
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log(`Generated content for Chapter ${chapterNumber}:`, content.substring(0, 200) + '...');
    console.log(`Target words: ${targetWords}, Actual words: ${content.split(' ').length}`);

    // Save chapter content to database
    const { data: currentBook, error: fetchError } = await supabase
      .from('book_generations')
      .select('chapter_content')
      .eq('id', bookId)
      .single();

    if (!fetchError && currentBook) {
      const updatedContent = currentBook.chapter_content || [];
      updatedContent[chapterNumber - 1] = {
        chapterNumber,
        chapterTitle,
        content,
        wordCount: content.split(' ').length,
        targetWordCount: targetWords,
        generatedAt: new Date().toISOString()
      };

      await supabase
        .from('book_generations')
        .update({
          chapter_content: updatedContent
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
      targetWordCount: targetWords
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