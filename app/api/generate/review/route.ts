import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const REVIEW_AGENT_PROMPT = `You are the Review Agent for BScribe.ai. Evaluate content and determine if it needs revision.

## EVALUATION CRITERIA

### 1. VARIETY SCORE (1-5)
- 5: Every paragraph feels fresh, no patterns detected
- 4: Mostly varied with 1-2 minor repetitions  
- 3: Some variety but patterns emerging
- 2: Formulaic, multiple patterns detected
- 1: Extremely repetitive

### 2. BRAND CONSISTENCY (1-5)
- Is the satirical voice maintained?
- Are insights emerging FROM satire, not replacing it?

### 3. ENERGY LEVEL (1-5)
- Does it maintain momentum?
- Are there screenshot-worthy moments?

### 4. PATTERN DETECTION
Check for:
- Repeated opening phrases
- Same paragraph structures
- Overused transitions
- Repetitive reader addresses
- Formulaic patterns

### 5. REVISION DECISION
Recommend revision if:
- Variety Score ≤ 3
- More than 2 formulaic patterns detected
- Multiple "watch" recommendations
- Energy Level ≤ 2

## OUTPUT FORMAT (JSON)

{
  "brandConsistency": 1-5,
  "brandComment": "brief comment",
  "varietyScore": 1-5,
  "energyLevel": 1-5,
  "formulaicFlags": ["specific patterns found"],
  "screenshotMoments": ["best quotable lines"],
  "recommendations": {
    "keep": ["strongest elements"],
    "consider": ["optional improvements"],
    "watch": ["must fix if revised"]
  },
  "requiresRevision": true/false,
  "revisionReason": "Clear explanation if revision needed"
}`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { content, chapterTitle, bookTitle, previousChapters = [] } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: REVIEW_AGENT_PROMPT +
          `\n\nBOOK: ${bookTitle}` +
          `\nCHAPTER: ${chapterTitle}` +
          `\n\nCONTENT TO REVIEW:\n${content}` +
          `\n\nNUMBER OF PREVIOUS CHAPTERS: ${previousChapters.length}`
      }]
    });

    const reviewText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    try {
      const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const reviewData = JSON.parse(jsonMatch[0]);
      
      // Auto-determine if revision needed
      reviewData.requiresRevision = reviewData.requiresRevision || 
        reviewData.varietyScore <= 3 ||
        reviewData.energyLevel <= 2 ||
        (reviewData.formulaicFlags && reviewData.formulaicFlags.length > 2) ||
        (reviewData.recommendations?.watch && reviewData.recommendations.watch.length > 2);
      
      if (reviewData.requiresRevision && !reviewData.revisionReason) {
        reviewData.revisionReason = `Low variety (${reviewData.varietyScore}/5) with ${reviewData.formulaicFlags?.length || 0} pattern warnings`;
      }
      
      return Response.json({
        success: true,
        review: reviewData
      });
      
    } catch (parseError) {
      console.error('Failed to parse review:', reviewText);
      throw new Error('Invalid review format');
    }

  } catch (error) {
    console.error('Review generation error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate review'
      },
      { status: 500 }
    );
  }
}