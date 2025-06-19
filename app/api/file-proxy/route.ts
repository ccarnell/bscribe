// app/api/file-proxy/route.ts - Enhanced debugging
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }
    
    console.log(`[FILE-PROXY] Requested path: ${filePath}`);
    
    const supabase = createAdminClient();
    
    // First, let's verify the file exists
    const { data: listData, error: listError } = await supabase.storage
      .from('books')
      .list(filePath.split('/')[0], {
        limit: 100,
        offset: 0
      });
    
    console.log('[FILE-PROXY] Files in directory:', listData?.map(f => f.name));
    
    // Try to create a public URL instead of signed URL
    const { data: publicUrlData } = supabase.storage
      .from('books')
      .getPublicUrl(filePath);
    
    console.log('[FILE-PROXY] Public URL:', publicUrlData?.publicUrl);
    
    // Try direct download as admin
    const { data, error } = await supabase.storage
      .from('books')
      .download(filePath);
    
    if (error) {
      console.error('[FILE-PROXY] Download error:', error);
      console.error('[FILE-PROXY] Error details:', JSON.stringify(error, null, 2));
      
      return new Response(JSON.stringify({
        error: 'Download failed',
        details: error.message,
        path: filePath,
        bucketFiles: listData?.map(f => f.name)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!data) {
      return new Response('No data returned', { status: 404 });
    }
    
    const filename = filePath.split('/').pop() || 'download';
    
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
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