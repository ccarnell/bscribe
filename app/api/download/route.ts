// app/api/download/route.ts - Updated to use existing purchases table
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

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

    const supabase = createClient();

    // Check if we already have a purchase record with access token
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_payment_intent_id', sessionId)
      .single();

    if (existingPurchase?.access_token) {
      // Return existing access token
      return NextResponse.json({
        success: true,
        accessToken: existingPurchase.access_token,
        bookTitle: existingPurchase.book_title || 'Your Book',
        downloadUrl: `/download/${existingPurchase.access_token}`
      });
    }

    // Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid or unpaid session' }, { status: 400 });
    }

    const bookTitle = session.metadata?.bookTitle || 'Complete Bullsh*t Bundle - All 6 Books';
    
    if (!BOOK_STORAGE_MAP[bookTitle]) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Generate permanent access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Update existing purchase record OR create new one
    if (existingPurchase) {
      // Update existing record with access token
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          access_token: accessToken
        })
        .eq('id', existingPurchase.id);

      if (updateError) {
        console.error('Failed to update purchase:', updateError);
      }
    } else {
      // Create new purchase record if none exists
      const { error: insertError } = await supabase
        .from('purchases')
        .insert({
          stripe_payment_intent_id: sessionId,
          access_token: accessToken,
          amount_cents: session.amount_total || 0,
          status: 'succeeded',
          // You'll need to add book info to your purchases table
          // or create a separate product reference
        });

      if (insertError) {
        console.error('Failed to create purchase:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      accessToken,
      bookTitle,
      downloadUrl: `/download/${accessToken}`
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}