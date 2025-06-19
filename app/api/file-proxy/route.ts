import { NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }
    
    console.log(`[FILE-PROXY] Requested: ${filePath}`);
    
    const supabase = createAdminClient();
    
    // Create a signed URL (5 minutes expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('books')
      .createSignedUrl(filePath, 300);
    
    if (urlError || !urlData?.signedUrl) {
      console.error('[FILE-PROXY] Signed URL error:', urlError);
      return new Response(JSON.stringify({
        error: 'Failed to create download URL',
        details: urlError?.message || 'Unknown error',
        path: filePath
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch the file using the signed URL
    const response = await fetch(urlData.signedUrl);
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch file',
        status: response.status,
        statusText: response.statusText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const blob = await response.blob();
    const filename = filePath.split('/').pop() || 'download';
    
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600'
      },
    });
    
  } catch (error) {
    console.error('[FILE-PROXY] Error:', error);
    return new Response(JSON.stringify({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}