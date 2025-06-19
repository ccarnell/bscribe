// /app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Not paid' }, { status: 400 });
    }

    // Simple mapping based on metadata
    const productId = session.metadata?.productId;
    
    if (productId === 'prod_paid_book_1') {
      return NextResponse.json({
        success: true,
        isBundle: false,
        downloadUrl: `/api/file-proxy?path=${encodeURIComponent('individual/book-1-millionaire-mindset-avocado-toast.pdf')}`,
        bookTitle: 'The Millionaire Mindset',
      });
    } else if (productId === 'prod_bundle') {
      return NextResponse.json({
        success: true,
        isBundle: true,
        bookTitle: 'Bundle of BS - First Dump',
        downloads: [
          {
            title: 'I Disrupted My Own Childhood Trauma',
            downloadUrl: `/api/file-proxy?path=${encodeURIComponent('free/free-ebook-1-v2-childhood-trauma-agile.pdf')}`
          },
          {
            title: 'The Millionaire Mindset',
            downloadUrl: `/api/file-proxy?path=${encodeURIComponent('individual/book-1-millionaire-mindset-avocado-toast.pdf')}`
          }
        ],
      });
    }
    
    return NextResponse.json({ error: 'Unknown product' }, { status: 404 });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}