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
    // Get the user's IP address for tracking votes
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';
    
    // Parse request body
    const { titleId } = await request.json();
    
    if (!titleId) {
      return Response.json(
        { success: false, error: 'Title ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the title exists
    const { data: title, error: titleError } = await supabaseAdmin
      .from('user_generated_titles')
      .select('id')
      .eq('id', titleId)
      .single();
      
    if (titleError || !title) {
      return Response.json(
        { success: false, error: 'Title not found' },
        { status: 404 }
      );
    }
    
    // Check if user has already voted for this title
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from('title_votes')
      .select('id')
      .eq('title_id', titleId)
      .eq('voter_ip', ip)
      .maybeSingle();
      
    if (existingVote) {
      // User has already voted, remove their vote (toggle functionality)
      const { error: deleteError } = await supabaseAdmin
        .from('title_votes')
        .delete()
        .eq('id', existingVote.id);
        
      if (deleteError) {
        return Response.json(
          { success: false, error: 'Failed to remove vote' },
          { status: 500 }
        );
      }
      
      // Get updated vote count after removing vote
      const { data: updatedTitle } = await supabaseAdmin
        .from('user_generated_titles')
        .select('vote_count')
        .eq('id', titleId)
        .single();
      
      return Response.json({
        success: true,
        voted: false,
        vote_count: updatedTitle?.vote_count || 0,
        message: 'Vote removed successfully'
      });
    }
    
    // User hasn't voted yet, add their vote
    const { error: insertError } = await supabaseAdmin
      .from('title_votes')
      .insert([
        {
          title_id: titleId,
          voter_ip: ip
        }
      ]);
      
    if (insertError) {
      return Response.json(
        { success: false, error: 'Failed to add vote' },
        { status: 500 }
      );
    }
    
    // Get updated vote count
    const { data: updatedTitle } = await supabaseAdmin
      .from('user_generated_titles')
      .select('vote_count')
      .eq('id', titleId)
      .single();
    
    return Response.json({
      success: true,
      voted: true,
      vote_count: updatedTitle?.vote_count || 0,
      message: 'Vote added successfully'
    });
    
  } catch (error) {
    console.error('Vote error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process vote' },
      { status: 500 }
    );
  }
}