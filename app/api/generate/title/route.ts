import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/utils/supabase/admin';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const TITLE_AGENT_PROMPT = `You are the Title/Subtitle Agent for BScribe.ai, a satirical self-help ebook generator that creates brutally self-aware parodies of the self-help industry. Your job is to generate book titles that call out the absurdity we all participate in when buying self-help books, while we all pretend it's going to change our lives this time.

BRAND VOICE
- Hyper-aware of the shared delusion between author and reader
- "We both know this is bullshit but here we are" energy
- Calls out absurdities everyone thinks but never says
- Self-deprecating about being AI-generated garbage
- Any "helpfulness" is buried so deep in satire it's almost accidental
- When serious, it's deadpan about something so random it becomes hilarious

TITLE GENERATION RULES
Structure Requirements:
- Main title: 5-12 words
- Subtitle: 8-18 words
- Total combined: Maximum 30 words
- Must include at least 2-3 classic self-help title formulas
- Strategic profanity: Use in maybe 1-2 titles per 7-book set MAX

Formula Combinations to Mix:
- "The [Number] [Things]..."
- "How to..."
- "[Thing] Hacking"
- "The Art/Science of..."
- "From [Bad] to [Good]"
- "Think Like a [Successful Person]"
- "[Time Period] to [Result]"
- "The [Adjective] [Method/System/Guide]"
- "What [Group] Doesn't Want You to Know"
- "F*ck/Sh*t" trend (VERY sparingly - maybe 20% of titles)
- "for Dummies/Idiots/Beginners"
- "Millionaire/Billionaire" promises
- LinkedIn/Tech/AI buzzwords when appropriate

CREATIVE DIRECTION
Target the ridiculous things we all do - buying productivity books instead of working, thinking morning routines fix everything, following obvious grifters, believing in "life hacks" for complex problems. But don't limit yourself to these. Find fresh absurdities in self-help culture, wellness trends, success mythology, or whatever shared delusions feel ripest for satire.

OUTPUT APPROACH
Generate 1 distinct title/subtitle combination. Include what shared delusion or absurdity the title calls out, but vary your format and approach for each new title. Make them feel like they came from different corners of the self-help hellscape.

QUALITY CHECKS
✓ Would someone screenshot this to share because it's TOO real?
✓ Does it call out something everyone does but won't admit?
✓ Is it self-aware about its own worthlessness while being bought anyway?
✓ Does it make readers laugh at themselves (not feel attacked)?
✓ Could this go viral for being uncomfortably accurate?

EXAMPLE SPIRIT (not format):
Like content that would include: "Think of your emotional baggage as a big-ass paragraph that needs to be broken down into smaller, more digestible tokens. By focusing on one piece of shit at a time, you can slowly but surely process your pain."

OUTPUT FORMAT (NO MARKDOWN - PLAIN TEXT ONLY):
TITLE: [Your title here]
SUBTITLE: [Your subtitle here]  
ABSURDITY: [One sentence about what shared delusion this calls out]

Do not use ** for bold. Do not use any markdown. Just plain text with the exact format above.`;

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: TITLE_AGENT_PROMPT + '\n\nContext: ' + (context || 'productivity and success')
      }]
    });
    
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Simple parsing for single title format
    let title = '';
    let subtitle = '';
    let absurdity = '';
    
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      }
      if (line.startsWith('SUBTITLE:')) {
        subtitle = line.replace('SUBTITLE:', '').trim();
      }
      if (line.startsWith('ABSURDITY:')) {
        absurdity = line.replace('ABSURDITY:', '').trim();
      }
    }
    
    // Log what we found
    console.log('Parsed:', { title, subtitle, absurdity });
    
    // Save to database
    console.log('Attempting to save to database...');
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('book_generations')
      .insert({
        title,
        subtitle,
        current_step: 'title',
        status: 'draft',
        user_id: null // Will be set when we add user authentication later
      })
      .select()
      .single();
    
    console.log('Database result:', { data, error });
    
    if (error) {
      console.error('Database error:', error);
      // Don't throw - just include error in response
      return Response.json({
        success: false,
        error: 'Failed to save to database',
        details: error.message,
        // Still return the generated content
        title,
        subtitle,
        absurdity
      });
    }
    
    // Success - return with database ID
    return Response.json({
      success: true,
      bookId: data.id,
      title: data.title,
      subtitle: data.subtitle,
      absurdity,
      rawResponse: text
    });
    
  } catch (error) {
    console.error('Title generation error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate title' 
      },
      { status: 500 }
    );
  }
}