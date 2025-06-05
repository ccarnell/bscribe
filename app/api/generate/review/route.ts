import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const REVIEW_AGENT_PROMPT = `Review this satirical self-help chapter and decide if it needs revision.

EVALUATION:
1. Is it SATIRICALLY FUNNY? (Most important)
2. Is it VARIED in structure?
3. Is any real advice buried deep into absurdity?
4. Are there repetitive patterns?

Give scores 1-5 and return ONLY valid JSON:
{
  "satireHumorScore": 1-5,
  "varietyScore": 1-5,
  "helpAbsurdity": 1-5,
  "requiresRevision": true/false,
  "reason": "why revision needed or why it's good"
}`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { content, chapterTitle } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: REVIEW_AGENT_PROMPT + `\n\nCHAPTER: ${chapterTitle}\n\nCONTENT:\n${content}`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON more reliably
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return Response.json({
        success: true,
        review: {
          satireHumorScore: 3,
          varietyScore: 3,
          helpAbsurdity: 3,
          requiresRevision: false,
          reason: "Could not parse review"
        }
      });
    }
    
    const review = JSON.parse(jsonMatch[0]);
    
    // Force revision if scores are too low
    if (!review.requiresRevision) {
      review.requiresRevision = review.humorScore <= 2 || review.varietyScore <= 2;
      if (review.requiresRevision) {
        review.reason = `Low scores: Humor ${review.humorScore}/5, Variety ${review.varietyScore}/5`;
      }
    }
    
    return Response.json({ success: true, review });

  } catch (error) {
    console.error('Review error:', error);
    return Response.json(
      { success: false, error: 'Review failed' },
      { status: 500 }
    );
  }
}