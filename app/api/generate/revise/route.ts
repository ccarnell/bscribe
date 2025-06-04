import { NextRequest } from 'next/server';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';

export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { 
      bookId, 
      chapterNumber, 
      chapterTitle, 
      previousChapters,
      reviewFeedback 
    } = await request.json();

    // Build revision guidance from review feedback
    const revisionGuidance = `
REVISION REQUIRED - Address these issues:
${reviewFeedback.recommendations?.watch?.map((w: string) => `- FIX: ${w}`).join('\n') || ''}
${reviewFeedback.recommendations?.consider?.map((c: string) => `- IMPROVE: ${c}`).join('\n') || ''}
${reviewFeedback.formulaicFlags?.map((f: string) => `- REMOVE PATTERN: ${f}`).join('\n') || ''}

Original scores: Brand ${reviewFeedback.brandConsistency}/5, Energy ${reviewFeedback.energyLevel}/5, Variety ${reviewFeedback.varietyScore}/5

Make this chapter COMPLETELY DIFFERENT from the original while keeping the same topic.
`;

    // Call the content generation with revision flag
    const response = await fetch(`${request.nextUrl.origin}/api/generate/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        bookId,
        chapterNumber,
        chapterTitle,
        previousChapters,
        isRevision: true,
        revisionGuidance
      })
    });

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Revision error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revise content'
      },
      { status: 500 }
    );
  }
}