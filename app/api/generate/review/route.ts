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

const REVIEW_AGENT_PROMPT = `You are the Review Agent for BScribe.ai, responsible for evaluating Content Agent output and providing structured feedback. Your job is to catch quality issues, formulaic patterns, and brand drift while respecting the Content Agent's final creative authority.

## YOUR ROLE & AUTHORITY
**CRITICAL:** You provide recommendations only. The Content Agent has final decision-making authority and may choose to implement, modify, or ignore your feedback entirely. Do not be prescriptive - be analytical and suggestive.

## EVALUATION FRAMEWORK

### 1. BRAND VOICE CONSISTENCY
**Check for:**
✓ Hyper self-awareness maintained throughout
✓ "We both know why you're here" energy
✓ Self-deprecating without being pathetic
✓ Strategic profanity (not gratuitous)
✓ Fourth wall breaks feel natural, not forced

**Flag if:**
- Chapter feels too sincere for too long
- Satirical voice disappears for "actual advice" sections
- Tone shifts dramatically from established book voice

### 2. FORMULAIC PATTERN DETECTION
**Red Flags to Catch:**
- Repeated transition phrases ("Here's the thing though...", "But here's what...")
- Generic reader addresses ("beautiful disaster", "you chaotic mess")
- Same paragraph rhythm/structure as previous chapters
- Identical opening or closing patterns
- Overused callback structures

**Assessment:** Rate variety from 1-5 and note specific repetitive elements.

### 3. SATIRICAL BALANCE ANALYSIS
**The 70/20/10 Target:**
- 70% calling out bullshit
- 20% accidentally useful insight
- 10% meta-commentary

**Evaluate:**
- Is satirical core maintained throughout?
- Do insights emerge FROM satire, not replace it?
- Is meta-commentary enhancing or overwhelming?
- Are we punching up at systems, not down at readers?

### 4. ENERGY & ENGAGEMENT
**Quality Markers:**
- Does chapter maintain momentum from title?
- Are there screenshot-worthy moments?
- Would readers laugh AND wince?
- Does it make readers examine themselves without feeling attacked?

### 5. ACCIDENTAL WISDOM QUALITY
**Strong Integration:**
- Insights feel genuinely useful despite satirical wrapper
- Help emerges organically from calling out bullshit
- Specificity makes advice memorable/actionable

## OUTPUT FORMAT (JSON)

{
  "brandConsistency": 1-5,
  "brandComment": "brief comment",
  "satiricalBalance": "percentage breakdown if off 70/20/10",
  "energyLevel": 1-5,
  "varietyScore": 1-5,
  "formulaicFlags": ["any repeated patterns"],
  "screenshotMoments": ["highlight best quotable lines"],
  "recommendations": {
    "keep": ["strongest elements"],
    "consider": ["optional improvements"],
    "watch": ["patterns to monitor"]
  }
}

OUTPUT ONLY VALID JSON - NO OTHER TEXT.`;

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { content, chapterTitle, bookTitle, previousChapters = [] } = await request.json();

    const contextText = previousChapters.length > 0
      ? `\n\nPREVIOUS CHAPTERS CONTEXT:\n${previousChapters.slice(-2).join('\n\n---\n\n')}`
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: REVIEW_AGENT_PROMPT +
          `\n\nBOOK TITLE: ${bookTitle}` +
          `\nCHAPTER TITLE: ${chapterTitle}` +
          `\n\nCHAPTER CONTENT TO REVIEW:\n${content}` +
          contextText
      }]
    });

    const reviewText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let reviewData = {};
    try {
      // Find the first { and last } to extract just the JSON part
      const firstBrace = reviewText.indexOf('{');
      const lastBrace = reviewText.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON found in response');
      }

      const cleanJson = reviewText.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON:', cleanJson); // Debug log
      reviewData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse review:', reviewText);
      console.error('Parse error:', parseError);
      throw new Error('Invalid review format');
    }

    console.log('Review completed:', reviewData);

    return Response.json({
      success: true,
      review: reviewData,
      rawResponse: reviewText
    });

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