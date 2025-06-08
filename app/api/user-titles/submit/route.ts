import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types_db';

// Initialize Supabase admin client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get the user's IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';
    
    // Parse request body to get selected titles
    const { selectedTitles } = await request.json();
    
    if (!selectedTitles || !Array.isArray(selectedTitles) || selectedTitles.length === 0) {
      return Response.json(
        { success: false, error: 'No titles selected for submission' },
        { status: 400 }
      );
    }
    
    // Validate each title
    for (const title of selectedTitles) {
      if (!title.title || !title.subtitle) {
        return Response.json(
          { success: false, error: 'Invalid title data' },
          { status: 400 }
        );
      }
    }
    
    // Insert each selected title into the database
    const { data, error } = await supabaseAdmin
      .from('user_generated_titles')
      .insert(
        selectedTitles.map(title => ({
          title: title.title,
          subtitle: title.subtitle,
          submitter_ip: ip
        }))
      )
      .select('id, title, subtitle, generated_at, vote_count');
    
    if (error) {
      console.error('Error saving titles:', error);
      return Response.json(
        { success: false, error: 'Failed to save titles' },
        { status: 500 }
      );
    }
    
    return Response.json({
      success: true,
      message: `${data.length} titles submitted successfully`,
      titles: data
    });
      
  } catch (error) {
    console.error('Submit error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit titles' },
      { status: 500 }
    );
  }
}