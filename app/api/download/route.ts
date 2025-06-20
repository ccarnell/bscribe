// /app/api/download-purchase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Find purchase record
    const { data: purchase, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('stripe_payment_intent_id', session.payment_intent)
      .single();

    if (error || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const downloadUrls = [];
    
    if (purchase.download_type === 'individual') {
      // Single book download
      const { data } = await supabaseAdmin.storage
        .from('books')
        .createSignedUrl('individual/book-1-millionaire-mindset-acovado-toast.pdf', 3600);
      
      if (data?.signedUrl) {
        downloadUrls.push(data.signedUrl);
      }
    } 
    else if (purchase.download_type === 'bundle') {
      // Bundle - get both files
      // Get the free book first
      const { data: files } = await supabaseAdmin.storage
        .from('books')
        .list('free');
      
      if (files && files.length > 0) {
        const { data: freeUrl } = await supabaseAdmin.storage
          .from('books')
          .createSignedUrl(`free/${files[0].name}`, 3600);
        
        if (freeUrl?.signedUrl) {
          downloadUrls.push(freeUrl.signedUrl);
        }
      }
      
      // Get the individual book
      const { data: individualUrl } = await supabaseAdmin.storage
        .from('books')
        .createSignedUrl('individual/book-1-millionaire-mindset-acovado-toast.pdf', 3600);
      
      if (individualUrl?.signedUrl) {
        downloadUrls.push(individualUrl.signedUrl);
      }
    }

    return NextResponse.json({ downloadUrls });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}