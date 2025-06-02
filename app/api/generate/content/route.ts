import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/utils/supabase/admin';

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
* Short paragraphs (2-4 sentences max)
* Mix confession-booth honesty with satirical advice
* Use specific examples that readers will recognize
* When being "helpful," make it weirdly specific or unexpected
* Reference being AI when it adds to the humor

## VARIETY REQUIREMENTS (CRITICAL)

**Avoid Formulaic Patterns:**
* Never use the same transition phrase twice in one book
* Vary your opening approach each chapter
* Don't default to generic reader addresses ("beautiful disaster," etc.)
* Mix up your paragraph structures and rhythm
* If you used "Here's the thing though..." once, find different transitions

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
* If Chapter 7, acknowledge the journey so far
* Use callbacks to earlier absurdities

## OUTPUT FORMAT
Write only the chapter content. No title, no chapter number, just the content. Start immediately with the chapter text.`;

export async function POST(request: Request) {
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

    const contextText = previousChapters.length > 0
      ? `\n\nPREVIOUS CHAPTERS:\n${previousChapters.join('\n\n---\n\n')}`
      : '';

    const targetWords = Math.floor(Math.random() * 200) + 200; // 200-400 random
    const wordInstruction = `\n\nIMPORTANT: Write exactly ${targetWords} words for this chapter.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: CONTENT_AGENT_PROMPT +
          `\n\nBOOK TITLE: ${book.title}` +
          `\nSUBTITLE: ${book.subtitle}` +
          `\n\nALL CHAPTER TITLES:\n${book.chapters.map((ch: any, i: number) => `${i + 1}. ${ch}`).join('\n')}` +
          `\n\nWRITE THIS CHAPTER:\n${chapterNumber}. ${chapterTitle}` +
          contextText
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    console.log(`Generated content for Chapter ${chapterNumber}:`, content.substring(0, 200) + '...');

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
        generatedAt: new Date().toISOString()
      };

      await supabase
        .from('book_generations')
        .update({
          chapter_content: updatedContent
        })
        .eq('id', bookId);
    }

    // THEN the return statement stays the same
    return Response.json({
      success: true,
      bookId,
      chapterNumber,
      chapterTitle,
      content,
      wordCount: content.split(' ').length
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