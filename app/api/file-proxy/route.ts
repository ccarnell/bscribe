// app/api/file-proxy/route.ts
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const filePath = searchParams.get('path');
    
    console.log('[FILE-PROXY] Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10)
    });
    
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }
    
    console.log(`[FILE-PROXY] Requested path: ${filePath}`);
    
    const supabase = createAdminClient();
    
    // First, let's verify we can access the bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('[FILE-PROXY] Buckets:', buckets?.map(b => b.name), 'Error:', bucketsError);
    
    // Try to list files in the directory
    const directory = filePath.split('/')[0]; // 'free' or 'individual'
    const { data: files, error: listError } = await supabase.storage
      .from('books')
      .list(directory);
    
    console.log('[FILE-PROXY] Files in directory:', files?.map(f => f.name), 'Error:', listError);
    
    // Now try the download
    const { data, error } = await supabase.storage
      .from('books')
      .download(filePath);
    
    console.log('[FILE-PROXY] Download result:', {
      hasData: !!data,
      dataSize: data?.size,
      error: error
    });
    
    if (error || !data) {
      return new Response(JSON.stringify({ 
        error: 'File download failed',
        details: {
          message: error?.message,
          path: filePath,
          bucket: 'books',
          directory: directory,
          filesInDirectory: files?.map(f => f.name)
        }
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const filename = filePath.split('/').pop() || 'download';
    
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600'
      },
    });
  } catch (error) {
    console.error('[FILE-PROXY] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}