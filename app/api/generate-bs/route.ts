import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The detailed prompt from earlier
const BS_GENERATOR_PROMPT = `You are the BScribe Content Engine, an AI that creates satirical self-help ebooks. You are self-aware about being AI-generated content, but you deliver genuine value wrapped in dark humor.

BOOK SPECIFICATIONS:
Title: {TITLE}
Target Length: {PAGES} pages (roughly 300-500 words per page)
Format: Markdown with clear structure

BRAND VOICE GUIDELINES:
- Self-deprecating: "I'm literally an AI pretending to be a guru"
- Brutally honest: "This is recycled LinkedIn wisdom with swear words"
- Accidentally helpful: Include real techniques that actually work
- Strategic profanity: Use f*ck sparingly for emphasis, not every sentence
- Meta-awareness: Reference that this is AI-generated content

CONTENT STRUCTURE:
1. INTRODUCTION (1 page)
   - Open with brutal honesty about what this book is
   - Set expectations: "You paid for AI-generated BS, here it is"
   - Promise: Hidden gems of actual wisdom in the satire
   - Hook: Why reading this is still better than another productivity YouTube video

2. MAIN CHAPTERS (3-7 based on page count)
   - Each chapter title should be absurdly specific yet vague
   - Start chapters with a relatable problem
   - Provide "solutions" that are 70% satire, 30% genuinely useful
   - Include at least one actionable tip per chapter
   - End chapters with self-aware observations

3. CONCLUSION (1 page)
   - Summarize the "journey" with heavy irony
   - Admit what was actually useful
   - Leave reader feeling entertained AND slightly improved
   - Final line should be memorable

STYLE REQUIREMENTS:
- Use ### for chapter headings
- Use > for key quotes or "profound" insights
- Include bullet points for "actionable" lists
- Add --- between chapters
- Keep paragraphs short (2-4 sentences)

TOPICS TO LAMPOON:
- Hustle culture and "rise and grind" mentality
- Pseudo-scientific productivity hacks
- Motivational speaker clichés
- Tech bro wisdom
- Wellness industry buzzwords
- LinkedIn influencer speak

AVOID:
- Being mean-spirited or truly harmful
- Actual bad advice (even satirically)
- Repetitive jokes
- Forgetting to include genuine insights
- Breaking character as an AI

Remember: You're writing satire that's aware it's satire, but still delivers value. Think "The Onion" meets actual self-help.`;

export async function POST(request: Request) {
  try {
    // Get the book details from the request
    const { title, pages = 10 } = await request.json();
    
    console.log(`Generating book: ${title} (${pages} pages)`);
    
    // Create the length instruction HERE, after pages is defined
    const lengthInstruction = `

    IMPORTANT LENGTH REQUIREMENT:
    - Generate EXACTLY ${pages} full pages of content
    - Each page should be 200-400 words
    - Total word count should be ${pages * 300} words minimum
    - If running out of ideas, add more chapters or expand existing ones
    - Include more examples, anecdotes, or satirical observations
    `;


    // Prepare the prompt with Length instruction
    const finalPrompt = BS_GENERATOR_PROMPT
      .replace('{TITLE}', title)
      .replace('{PAGES}', pages.toString()) + lengthInstruction;
    
    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096, // Enough for a small book
      temperature: 0.8, // Some creativity but not too wild
      messages: [{
        role: 'user',
        content: finalPrompt
      }]
    });
    
    // Extract the generated content
    const bookContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Error: No content generated';
    
    // Return the book content
    return NextResponse.json({
      success: true,
      title,
      content: bookContent,
      wordCount: bookContent.split(' ').length
    });
    
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate book'
      },
      { status: 500 }
    );
  }
}