import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '../../../../utils/auth-helpers/api-auth';
import { getIndustryById, getRandomContext } from '@/config/industries';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const TITLE_AGENT_PROMPT = `You are the Title/Subtitle Agent for BScribe.ai, a satirical {INDUSTRY_NAME} ebook generator that creates hyper self-aware parodies of the {INDUSTRY_NAME} industry. Your job is to generate book titles that call out the absurdity we all participate in when buying things we all pretend are going to change our lives this time.

TARGET AUDIENCE: {TARGET_AUDIENCE}
CONTEXT: {CONTEXT}

REQUIREMENTS:
- Cram as many RANDOM_CONTEXTS into titles as possible
- Title: 5-12 words
- Subtitle: 8-18 words continuing the absurdity
- Must be funny satirical but believable enough someone might buy it
- Include {INDUSTRY_NAME} clichés but twist them
- Reference the context provided but don't be limited by it
- Mock {EXPERT_TYPES} and their {INDUSTRY_TERMS}
- Call out {COMMON_MYTHS} that everyone believes

QUALITY CHECKS
✓ Would someone screenshot this to share because it's TOO real?
✓ Does it call out something everyone does but won't admit?
✓ Is it hyper self-aware about its own irrationality?
✓ Does it make readers feel like we are laughing with them (not feel attacked)?
✓ Could this go viral for being uncomfortably accurate?

EXAMPLE SPIRIT (not format):
Like content that would include: "Think of your emotional baggage as a big-ass paragraph that needs to be broken down into smaller, more digestible tokens. By focusing on one piece of shit at a time, you can slowly but surely process your pain."

IMPORTANT: Be creative. Be wild. Be funny. Chaos Theory. Don't default to safe choices.

OUTPUT FORMAT (NO MARKDOWN - PLAIN TEXT ONLY):
TITLE: [Your title here]
SUBTITLE: [Your subtitle here]

Do not use ** for bold. Do not use any markdown. Just plain text with the exact format above.`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { industry = 'self-help' } = await request.json();
    
    // Get industry configuration
    const industryConfig = getIndustryById(industry);
    if (!industryConfig) {
      return Response.json(
        { success: false, error: 'Invalid industry specified' },
        { status: 400 }
      );
    }

    // Get random context for this industry
    const randomContext = getRandomContext(industry);
    
    // Build the prompt with industry-specific variables
    const prompt = TITLE_AGENT_PROMPT
      .replace(/{INDUSTRY_NAME}/g, industryConfig.name)
      .replace('{TARGET_AUDIENCE}', industryConfig.targetAudience)
      .replace('{CONTEXT}', randomContext)
      .replace('{EXPERT_TYPES}', industryConfig.voiceAdjustments.expertTypes.join(', '))
      .replace('{INDUSTRY_TERMS}', industryConfig.voiceAdjustments.industrySpecificTerms.join(', '))
      .replace('{COMMON_MYTHS}', industryConfig.voiceAdjustments.commonMyths.join(', '));
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.95, // Higher for more creativity
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse response
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

    return Response.json({
      success: true,
      title,
      subtitle,
      absurdity,
      context: randomContext,
      industry: industry
    });
      
  } catch (error) {
    console.error('Title generation error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate title' },
      { status: 500 }
    );
  }
}
