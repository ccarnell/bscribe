// app/api/admin/book/[bookId]/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { data: book, error } = await supabaseAdmin
      .from('book_generations')
      .select('*')
      .eq('id', params.bookId)
      .single();

    if (error || !book) {
      return Response.json({ 
        success: false, 
        error: 'Book not found' 
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      book: book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch book' 
    }, { status: 500 });
  }
}