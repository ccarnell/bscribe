// app/api/generate/review/route.ts
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const REVIEW_AGENT_PROMPT = `You are a review agent for satirical self-help content. Evaluate this chapter and provide specific, actionable feedback.

SCORING CRITERIA:
1. Satire Quality (1-5): Is it genuinely funny and self-aware?
2. Structural Variety (1-5): Does it avoid formulaic patterns?
3. Absurdity Balance (1-5): Is real advice properly buried in nonsense?

REVISION TRIGGERS (requires revision if ANY are true):
- Satire Quality score ≤ 2
- Structural Variety score ≤ 2
- More than 3 formulaic patterns detected
- Reads like actual self-help (not satirical enough)

IMPORTANT: Be critical! Most first drafts should score 2-3 and need revision.

Return ONLY this JSON structure (no markdown, no extra text):
{
  "satireScore": 1-5,
  "varietyScore": 1-5,
  "absurdityScore": 1-5,
  "requiresRevision": true/false,
  "revisionReason": "specific reason if revision needed",
  "recommendations": ["specific suggestion 1", "specific suggestion 2"],
  "formulaicPatterns": ["pattern 1", "pattern 2"],
  "bestLines": ["quotable line 1", "quotable line 2"]
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
    
    console.log('Raw review response:', text); // Debug log
    
    // More robust JSON extraction
    let review;
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Failed to parse review:', e);
      console.error('Raw text was:', text);
      
      // Return a review that forces revision on parse failure
      review = {
        satireScore: 2,
        varietyScore: 2,
        absurdityScore: 2,
        requiresRevision: true,
        revisionReason: "Review parsing failed - regenerating to ensure quality",
        recommendations: ["Ensure content is sufficiently satirical", "Add more variety to structure"],
        formulaicPatterns: [],
        bestLines: []
      };
    }
    
    // Enforce revision rules
    if (review.satireScore <= 2 || review.varietyScore <= 2) {
      review.requiresRevision = true;
      if (!review.revisionReason) {
        review.revisionReason = `Low scores - Satire: ${review.satireScore}/5, Variety: ${review.varietyScore}/5`;
      }
    }
    
    console.log('Final review:', review); // Debug log
    
    return Response.json({ 
      success: true, 
      review
    });

  } catch (error) {
    console.error('Review error:', error);
    return Response.json(
      { success: false, error: 'Review failed' },
      { status: 500 }
    );
  }
}