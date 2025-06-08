import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types_db';

// Initialize Supabase admin client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Same prompt as admin but without admin-specific instructions
const TITLE_AGENT_PROMPT = `You are the Title/Subtitle Agent for BScribe.ai, a satirical self-help ebook generator that creates hyper self-aware parodies of the self-help industry. Your job is to generate book titles that call out the absurdity we all participate in when buying self-help books, while we all pretend it's going to change our lives this time.

CONTEXT: {CONTEXT}

REQUIREMENTS:
- Cram as many RANDOM_CONTEXTS into titles as possible
- Title: 5-12 words that promises impossible transformation
- Subtitle: 8-18 words of elaboration on the bullshit
- Must be satirical but believable enough someone might buy it
- Include self-help clichés but twist them
- Reference the context provided but don't be limited by it

QUALITY CHECKS
✓ Would someone screenshot this to share because it's TOO real?
✓ Does it call out something everyone does but won't admit?
✓ Is it self-aware about its own worthlessness while being bought anyway?
✓ Does it make readers laugh at themselves (not feel attacked)?
✓ Could this go viral for being uncomfortably accurate?

EXAMPLE SPIRIT (not format):
Like content that would include: "Think of your emotional baggage as a big-ass paragraph that needs to be broken down into smaller, more digestible tokens. By focusing on one piece of shit at a time, you can slowly but surely process your pain."

IMPORTANT: Be creative. Be wild. Be funny. Don't default to safe choices.

OUTPUT FORMAT (NO MARKDOWN - PLAIN TEXT ONLY):
TITLE: [Your title here]
SUBTITLE: [Your subtitle here]

Do not use ** for bold. Do not use any markdown. Just plain text with the exact format above.`;

// Randomized contexts to prevent repetition (same as admin)
const RANDOM_CONTEXTS = [
  "The [Number] format (7)",
  "F*ck/Sh*t trend (VERY sparingly - maybe 20% of titles)",
  "productivity obsession",
  "Secrets of... (class problem-solver setup)",
  "How to...",
  "hustle culture",
  "The Art of...",
  "Everything You Need to Know About...",
  "The Science of...",
  "Why...",
  "[Millionaire/Billionaire] (Wealth)",
  "...for Dummies/Idiots/Beginners",
  "(wellness trends and expensive supplements)",
  "The Power of...",
  "Not Giving a...",
  "...That Will Change Your Life Forever",
  "The [Number}-[Time] (Minute/Hour/Day/Week/Month) [Solution]",
  "(crypo bros or financial freedom)",
  "(personal branding and though leadership)",
  "From Zero to Hero",
  "The Ultimate Guide",
  "(identity aspirational formula)",
  "Win at Life (vague outcome promise)",
  "(biohacking)",
  "The [Adjective] [Method/System/Guide]",
  "What [Group] Doesn't Want You to Know",
  "The [Adjective] [Topic] Revolution",
  "(startup culture and failing upward)",
  "The [Adjective] Way to [Result]",
  "(cultural anxiety / chaos trope)",
  "(pseudo-wisdome name-dropping)",
  "(Tony-Robbings-meets-Instagram motif)",
  "(Morning routing fetishism)",
  "(self-care industrial complex)",
  "(AI-speak parodies)",
  "(LinkedIn thought leader parodies)",
  "(humblebrag launch posts with emojis",
  "(manifestation and law of attraction)",
  "...Unbreakable Habits",
  "Grit, Genius, and Getting to Your Goals (alliteration)",
  "...in a [Place] That...",
  "Why Everything You Know is Wrong About [Topic]",
  "The [Number] [Things]...",
  "From [Bad] to [Good]",
  "(buzzwords and jargon overload)",
  "(buying productivity books instead of working)",
  "(thinking morning routines fix everything)",
  "(following obvious grifters)",
  "(believing in 'life hacks' for complex problems",
  "(success mythology)"
];

export async function POST(request: NextRequest) {
  try {
      console.log('=== USER TITLE GENERATE START ===');
    // Parse request body to get slot index
    const { slotIndex } = await request.json();
    
    if (slotIndex === undefined || slotIndex < 0 || slotIndex > 2) {
      return Response.json(
        { success: false, error: 'Invalid slot index. Must be 0, 1, or 2.' },
        { status: 400 }
      );
    }

    // Get the user's IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';
    
    // Check if we're in development environment
    const isDev = process.env.NODE_ENV === 'development';
    
    // Skip rate limiting checks in development mode
    if (!isDev) {
      // Check individual rate limit (now 12 per day per IP)
      const { data: rateLimitCheck } = await supabaseAdmin.rpc(
        'check_user_generation_rate_limit',
        { p_submitter_ip: ip }
      );
      
      if (!rateLimitCheck) {
        return Response.json(
          { 
            success: false, 
            error: 'Rate limit reached. You can only make 12 API calls per day.',
            dev: isDev
          },
          { status: 429 }
        );
      }
      
      // Check global rate limit (now 5000 per hour across all users)
      const { data: globalRateLimitCheck } = await supabaseAdmin.rpc(
        'check_global_generation_rate_limit'
      );
      
      if (!globalRateLimitCheck) {
        return Response.json(
          { 
            success: false, 
            error: 'Global rate limit reached. Please try again later.',
            dev: isDev
          },
          { status: 429 }
        );
      }
    }

    // Get random context
    const randomContext = RANDOM_CONTEXTS[Math.floor(Math.random() * RANDOM_CONTEXTS.length)];
    
    // Generate title using Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.95, // Higher for more creativity
      messages: [{
        role: 'user',
        content: TITLE_AGENT_PROMPT.replace('{CONTEXT}', randomContext)
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse response
    let title = '';
    let subtitle = '';

    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      }
      if (line.startsWith('SUBTITLE:')) {
        subtitle = line.replace('SUBTITLE:', '').trim();
      }
    }

    // Track API usage for cost monitoring (except in development)
    if (!isDev) {
      await supabaseAdmin.from('api_usage').insert([
        {
          endpoint: 'user-titles/generate',
          tokens_used: response.usage.input_tokens + response.usage.output_tokens,
          cost: (response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015),
          metadata: { ip, slotIndex }
        }
      ]);
    } else {
      console.log('Development mode: Skipping API usage tracking');
    }

    // Note: No longer saving to database immediately - only return the generated title
    return Response.json({
      success: true,
      title,
      subtitle,
      slotIndex,
      context: randomContext,
      dev: isDev
    });
      
  } catch (error) {
    console.error('=== USER TITLE GENERATE START ===');
    console.error('Title generation error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate title' },
      { status: 500 }
    );
  }
}