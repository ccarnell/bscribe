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
    const { bookId, title, subtitle } = await request.json();

    if (!bookId || !title || !subtitle) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if chapters are already generated (would prevent title editing)
    const { data: book } = await supabaseAdmin
      .from('book_generations')
      .select('chapters, chapters_locked, title_locked')
      .eq('id', bookId)
      .single();

    if (!book) {
      return Response.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.title_locked) {
      return Response.json({ 
        success: false, 
        error: 'Title is locked and cannot be edited' 
      }, { status: 400 });
    }

    if (book.chapters?.length > 0 && book.chapters_locked) {
      return Response.json({ 
        success: false, 
        error: 'Cannot edit title after chapters are locked' 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('book_generations')
      .update({
        title,
        subtitle,
        last_edited_at: new Date().toISOString(),
        edited_by: authResult.user.id
      })
      .eq('id', bookId);

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { success: false, error: 'Failed to update title' },
        { status: 500 }
      );
    }

    return Response.json({ 
      success: true, 
      message: 'Title updated successfully' 
    });

  } catch (error) {
    console.error('Title edit error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
