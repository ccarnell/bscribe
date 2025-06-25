import { NextRequest } from 'next/server';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

export async function PUT(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { bookId, chapters } = await request.json();

    if (!bookId || !chapters || !Array.isArray(chapters)) {
      return Response.json(
        { success: false, error: 'Missing required fields or invalid chapters format' },
        { status: 400 }
      );
    }

    // Check if content is already generated
    const { data: book } = await supabaseAdmin
      .from('book_generations')
      .select('chapter_content, chapters_locked')
      .eq('id', bookId)
      .single();

    if (!book) {
      return Response.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.chapters_locked) {
      return Response.json({ 
        success: false, 
        error: 'Chapters are locked and cannot be edited' 
      }, { status: 400 });
    }

    const hasGeneratedContent = book.chapter_content?.some((ch: any) => ch?.content);
    if (hasGeneratedContent) {
      return Response.json({ 
        success: false, 
        error: 'Cannot edit chapters after content is generated' 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('book_generations')
      .update({
        chapters,
        last_edited_at: new Date().toISOString(),
        edited_by: authResult.user.id
      })
      .eq('id', bookId);

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { success: false, error: 'Failed to update chapters' },
        { status: 500 }
      );
    }

    return Response.json({ 
      success: true, 
      message: 'Chapters updated successfully' 
    });

  } catch (error) {
    console.error('Chapters edit error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
