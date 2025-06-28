// app/api/file-proxy/route.ts - Fix for non-public bucket
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');
    
    if (!filePath) {
      return Response.json({ error: 'File path required' }, { status: 400 });
    }

    // Check environment variable
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE) {
      return Response.json({ 
        error: 'Missing service role key',
        hasKey: false 
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return Response.json({ 
        error: 'Missing Supabase URL' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // First, try to list the directory to verify connection
    const directory = filePath.split('/')[0]; // Get 'free' from 'free/filename.pdf'
    const { data: listData, error: listError } = await supabaseAdmin.storage
      .from('books')
      .list(directory);

    if (listError) {
      return Response.json({ 
        error: 'Cannot list directory',
        directory,
        listError: JSON.parse(JSON.stringify(listError)) // Force serialization
      }, { status: 500 });
    }

    // Log what files we found
    const fileNames = listData?.map(f => f.name) || [];
    
    // Now try the download
    const { data, error } = await supabaseAdmin.storage
      .from('books')
      .download(filePath);

    if (error) {
      return Response.json({ 
        error: 'Download failed',
        details: JSON.parse(JSON.stringify(error)), // Force serialization
        path: filePath,
        filesInDirectory: fileNames,
        bucketUsed: 'books'
      }, { status: 500 });
    }

    if (!data) {
      return Response.json({ 
        error: 'No data returned',
        path: filePath 
      }, { status: 404 });
    }

    // Success - return the file
    const fileName = filePath.split('/').pop() || 'download.pdf';
    
    // Log the actual file download
    try {
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('session_id') || 'direct_download';
      const customerEmail = url.searchParams.get('customer_email') || null;
      
      await supabaseAdmin
        .from('download_logs')
        .insert({
          session_id: sessionId,
          book_title: fileName.replace('.pdf', '').replace('-', ' '),
          customer_email: customerEmail,
          downloaded_at: new Date().toISOString()
        });
        
      console.log(`✅ File download logged: ${fileName} for session: ${sessionId}`);
    } catch (logError) {
      console.error('Failed to log file download:', logError);
      // Continue anyway - the download is more important than logging
    }
    
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': data.size.toString(),
        'Cache-Control': 'private, max-age=3600'
      }
    });
  } catch (error: any) {
    return Response.json({ 
      error: 'Unexpected error',
      details: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        type: typeof error,
        name: error?.name
      }
    }, { status: 500 });
  }
}
