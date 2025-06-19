// app/api/file-proxy/route.ts - Fix for non-public bucket
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }
    
    console.log('[FILE-PROXY] Attempting download:', filePath);
    
    // Create admin client with service role - this bypasses RLS and bucket permissions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
    );
    
    // Download from private bucket using service role
    const { data, error } = await supabaseAdmin.storage
      .from('books')
      .download(filePath);
    
    if (error) {
      console.error('[FILE-PROXY] Download error:', error);
      return new Response(JSON.stringify({ 
        error: 'Download failed', 
        details: error.message,
        path: filePath
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!data) {
      return new Response('File not found', { status: 404 });
    }
    
    // Get the filename from the path
    const filename = filePath.split('/').pop() || 'download.pdf';
    
    // Return the file as a response
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('[FILE-PROXY] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}