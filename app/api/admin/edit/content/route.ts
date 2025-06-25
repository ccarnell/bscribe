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
    const { bookId, chapterNumber, content } = await request.json();

    if (!bookId || !chapterNumber || !content) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current book data
    const { data: book, error: fetchError } = await supabaseAdmin
      .from('book_generations')
      .select('chapter_content, chapters')
      .eq('id', bookId)
      .single();

    if (fetchError || !book) {
      return Response.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Validate chapter number
    if (chapterNumber < 1 || chapterNumber > (book.chapters?.length || 0)) {
      return Response.json(
        { success: false, error: 'Invalid chapter number' },
        { status: 400 }
      );
    }

    // Update the specific chapter content
    const chapterContent = book.chapter_content || [];
    const chapterIndex = chapterNumber - 1;
    
    // Ensure the array is large enough
    while (chapterContent.length <= chapterIndex) {
      chapterContent.push(null);
    }

    // Update the chapter
    chapterContent[chapterIndex] = {
      ...chapterContent[chapterIndex],
      chapterNumber,
      chapterTitle: book.chapters[chapterIndex],
      content,
      wordCount: content.split(' ').length,
      editedAt: new Date().toISOString(),
      editedBy: authResult.user.id
    };

    const { error } = await supabaseAdmin
      .from('book_generations')
      .update({
        chapter_content: chapterContent,
        last_edited_at: new Date().toISOString(),
        edited_by: authResult.user.id
      })
      .eq('id', bookId);

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { success: false, error: 'Failed to update content' },
        { status: 500 }
      );
    }

    return Response.json({ 
      success: true, 
      message: 'Content updated successfully',
      wordCount: content.split(' ').length
    });

  } catch (error) {
    console.error('Content edit error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
