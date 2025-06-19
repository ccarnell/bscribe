import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Check database
    const { error: dbError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    // Check Stripe (just veryify env var exists)
    const stripeConnected = !!process.env.STRIPE_SECRET_KEY;
    
    // Check AI API  
    const aiConnected = !!process.env.ANTHROPIC_API_KEY;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: !dbError,
        payments: stripeConnected,
        ai: aiConnected
      }
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}