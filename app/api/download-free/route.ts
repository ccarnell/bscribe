// app/api/download-free/route.ts - Endpoint for handling free book downloads
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_DOWNLOADS_PER_IP = 25; // Max downloads per IP per hour

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Map of free book IDs to their file paths and metadata
// Structure is designed to be scalable for future free books
interface FreeBookInfo {
  path: string;      // Path in Supabase Storage (including folder)
  title: string;     // Book title for logging and display
}

const FREE_BOOK_MAP: { [key: string]: FreeBookInfo } = {
  "prod_free_book_1": {
    path: "free/free-ebook-1-v2-childhood-trauma-agile.pdf",
    title: "I Disrupted My Own Childhood Trauma using Agile Methodology"
  }
};

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limiting
    const now = Date.now();
    const rateLimitKey = `free_download_${clientIP}`;
    const rateLimitData = rateLimitStore.get(rateLimitKey);
    
    if (rateLimitData) {
      if (now < rateLimitData.resetTime) {
        if (rateLimitData.count >= MAX_DOWNLOADS_PER_IP) {
          console.log(`Rate limit exceeded for IP: ${clientIP}`);
          return NextResponse.json(
            { error: 'Too many download attempts. Please try again later.' }, 
            { status: 429 }
          );
        }
        // Increment count
        rateLimitStore.set(rateLimitKey, {
          count: rateLimitData.count + 1,
          resetTime: rateLimitData.resetTime
        });
      } else {
        // Reset window
        rateLimitStore.set(rateLimitKey, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW
        });
      }
    } else {
      // First request from this IP
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
    }

    // Parse the request body to get the bookId
    const body = await request.json();
    const { bookId } = body;
    
    console.log("Free download request received for bookId:", bookId);
    
    if (!bookId) {
      console.error("No book ID provided");
      return NextResponse.json({ error: 'No book ID provided' }, { status: 400 });
    }

    // Check if this is a valid free book ID
    const bookInfo = FREE_BOOK_MAP[bookId];
    if (!bookInfo) {
      console.error("Invalid book ID:", bookId);
      return NextResponse.json({ error: 'Invalid book ID', bookId }, { status: 400 });
    }
    
    // For development, return a mock image
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode - returning mock download URL");
      return NextResponse.json({
        success: true,
        downloadUrl: '/i-disrupted-my-own-childhood-trauma-book-cover-image.png',
        dev: true
      });
    }
    
    // Use our new file proxy to handle the download
    const proxyUrl = `/api/file-proxy?path=${encodeURIComponent(bookInfo.path)}`;
    console.log(`Using file proxy: ${proxyUrl}`);
    
    // Log the download
    try {
      const supabase = createClient();
      const sessionId = request.headers.get('x-session-id') || `free_${Date.now()}`;
      
      await supabase
        .from('download_logs')
        .insert({
          session_id: sessionId,
          book_title: bookInfo.title,
          customer_email: null,
          downloaded_at: new Date().toISOString()
        });
        
      console.log("Download logged successfully");
    } catch (logError) {
      console.error("Error logging download:", logError);
      // Continue anyway - the download is more important than the logging
    }
    
    // Return the proxy URL
    return NextResponse.json({
      success: true,
      downloadUrl: proxyUrl,
      title: bookInfo.title
    });

  } catch (error) {
    console.error('Free download API error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request', details: String(error) },
      { status: 500 }
    );
  }
}
