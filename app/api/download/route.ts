import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';

// Map your book titles to storage paths
const BOOK_STORAGE_MAP: { [key: string]: string } = {
  "The 7 F*cking Secrets of How to Hack the Art of Everything You Need to Know": "individual/book-1-seven-secrets.pdf",
  "Think Like a Motherf*cking Navy SEAL CEO": "individual/book-2-navy-seal-ceo.pdf",
  "From Broke-Ass Loser to F*ckable Billionaire in 30 Minutes": "individual/book-3-broke-to-billionaire.pdf",
  "The 42-Parameter Deep Learning Framework for Optimizing Your Neural Pathways": "individual/book-4-deep-learning.pdf",
  "Authentically Leveraging Your Personal Brand's F*cking Synergy": "individual/book-5-personal-brand.pdf",
  "Zero-Shot Learning the Art of Maximum F*ckery": "individual/book-6-zero-shot.pdf",
  "Complete Bullsh*t Bundle - All 6 Books": "bundles/bscribe-complete-bundle.pdf"
};

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    // Verify the checkout session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid or unpaid session' }, { status: 400 });
    }

    // Get the book title from session metadata
    const bookTitle = session.metadata?.bookTitle || session.line_items?.data[0]?.description;
    
    if (!bookTitle || !BOOK_STORAGE_MAP[bookTitle]) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Generate a signed URL from Supabase Storage (1 hour expiry)
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from('books')
      .createSignedUrl(BOOK_STORAGE_MAP[bookTitle], 3600); // 1 hour

    if (error || !data) {
      console.error('Storage error:', error);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Store this download attempt (optional but good for tracking)
    await supabase.from('download_logs').insert({
      session_id: sessionId,
      book_title: bookTitle,
      customer_email: session.customer_email,
      downloaded_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      downloadUrl: data.signedUrl,
      expiresIn: 3600,
      bookTitle: bookTitle
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}