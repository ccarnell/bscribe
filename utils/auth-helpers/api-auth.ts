// utils/auth-helpers/api-auth.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function checkAdminAuth(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user from auth
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' }, 
        { status: 401 }
      );
    }
    
    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Return user if auth successful
    return { user, profile };
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}