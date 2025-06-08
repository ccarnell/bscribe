// app/api/file-proxy/route.ts - Secure proxy to download files from Supabase Storage
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    // Get file path from query parameters
    const searchParams = new URL(request.url).searchParams;
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }
    
    console.log(`File proxy request for: ${filePath}`);
    
    // Get admin client to bypass permissions
    const supabase = createAdminClient();
    
    // Determine content type based on file extension
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (fileExtension === 'pdf') {
      contentType = 'application/pdf';
    } else if (['jpg', 'jpeg'].includes(fileExtension || '')) {
      contentType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      contentType = 'image/png';
    }
    
    // Get filename for the download
    const filename = filePath.split('/').pop() || 'download';
    
    // Try to download the file
    const { data, error } = await supabase.storage
      .from('books') // Use the correct bucket name
      .download(filePath);
    
    if (error || !data) {
      console.error(`File download failed: ${error?.message}`);
      return new Response(`File download failed: ${error?.message}`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Log successful download
    console.log(`Successfully downloaded: ${filePath}`);
    
    // Return the file with appropriate headers
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('File proxy error:', error);
    return new Response(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}