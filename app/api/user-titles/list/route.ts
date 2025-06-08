import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types_db';

// Initialize Supabase admin client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters with defaults
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeFilter = searchParams.get('timeFilter') || 'all'; // today, week, month, all
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, votes
    
    // Calculate pagination offset
    const offset = (page - 1) * limit;
    
    // Build query based on time filter
    let query = supabaseAdmin
      .from('user_generated_titles')
      .select('id, title, subtitle, generated_at, vote_count')
      .eq('is_approved', true);
    
    // Apply time filter
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        query = query.gte('generated_at', todayStart.toISOString());
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        query = query.gte('generated_at', weekStart.toISOString());
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        query = query.gte('generated_at', monthStart.toISOString());
        break;
      // 'all' - no additional filter needed
    }
    
    // Apply sorting
    if (sortBy === 'votes') {
      query = query.order('vote_count', { ascending: false });
    } else {
      // Default to most recent
      query = query.order('generated_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: titles, error, count } = await query;
    
    if (error) {
      console.error('Error fetching titles:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch titles' },
        { status: 500 }
      );
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from('user_generated_titles')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', true);
    
    return Response.json({
      success: true,
      titles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('List error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list titles' },
      { status: 500 }
    );
  }
}