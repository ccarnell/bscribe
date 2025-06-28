import { NextRequest } from 'next/server';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_OVERRIDE!
);

export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // === DOWNLOAD ANALYTICS ===
    // Total downloads
    const { data: totalData } = await supabaseAdmin
      .from('download_logs')
      .select('*', { count: 'exact' });

    // Unique customers from downloads
    const { data: uniqueData } = await supabaseAdmin
      .from('download_logs')
      .select('customer_email')
      .not('customer_email', 'is', null);
    
    const uniqueDownloadCustomers = new Set(uniqueData?.map(d => d.customer_email)).size;

    // Downloads by book - manual aggregation
    const { data: allDownloads } = await supabaseAdmin
      .from('download_logs')
      .select('book_title, customer_email');

    interface BookStats {
      downloads: number;
      uniqueCustomers: Set<string>;
    }

    const bookStats: Record<string, BookStats> = {};
    allDownloads?.forEach(download => {
      const title = download.book_title || 'Unknown';
      if (!bookStats[title]) {
        bookStats[title] = { downloads: 0, uniqueCustomers: new Set() };
      }
      bookStats[title].downloads++;
      if (download.customer_email) {
        bookStats[title].uniqueCustomers.add(download.customer_email);
      }
    });

    const bookBreakdown = Object.entries(bookStats).map(([title, stats]) => ({
      book_title: title,
      downloads: stats.downloads,
      unique_customers: stats.uniqueCustomers.size
    }));

    // Recent downloads
    const { data: recentData } = await supabaseAdmin
      .from('download_logs')
      .select('book_title, customer_email, downloaded_at')
      .order('downloaded_at', { ascending: false })
      .limit(20);
    
    // Daily download stats
    const { data: dailyDownloads } = await supabaseAdmin
      .from('download_logs')
      .select('downloaded_at');
    
    const dailyDownloadStats: Record<string, number> = {};
    dailyDownloads?.forEach(download => {
      const date = new Date(download.downloaded_at).toISOString().split('T')[0];
      dailyDownloadStats[date] = (dailyDownloadStats[date] || 0) + 1;
    });

    const dailyDownloadData = Object.entries(dailyDownloadStats)
      .map(([date, downloads]) => ({ download_date: date, downloads }))
      .sort((a, b) => b.download_date.localeCompare(a.download_date))
      .slice(0, 30);

    // === PURCHASE ANALYTICS ===
    // Total purchases and revenue
    const { data: purchaseData } = await supabaseAdmin
      .from('purchases')
      .select('amount_cents, status, purchased_at, download_type, buyer_id')
      .eq('status', 'succeeded');

    const totalPurchases = purchaseData?.length || 0;
    const totalRevenue = purchaseData?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;
    const uniquePurchaseCustomers = new Set(purchaseData?.map(p => p.buyer_id)).size;

    // Purchase breakdown by type
    const purchaseBreakdown: Record<string, { count: number; revenue: number }> = {};
    purchaseData?.forEach(purchase => {
      const type = purchase.download_type || 'unknown';
      if (!purchaseBreakdown[type]) {
        purchaseBreakdown[type] = { count: 0, revenue: 0 };
      }
      purchaseBreakdown[type].count++;
      purchaseBreakdown[type].revenue += purchase.amount_cents || 0;
    });

    // Daily purchase stats
    const dailyPurchaseStats: Record<string, { count: number; revenue: number }> = {};
    purchaseData?.forEach(purchase => {
      const date = new Date(purchase.purchased_at).toISOString().split('T')[0];
      if (!dailyPurchaseStats[date]) {
        dailyPurchaseStats[date] = { count: 0, revenue: 0 };
      }
      dailyPurchaseStats[date].count++;
      dailyPurchaseStats[date].revenue += purchase.amount_cents || 0;
    });

    const dailyPurchaseData = Object.entries(dailyPurchaseStats)
      .map(([date, stats]) => ({ 
        purchase_date: date, 
        purchases: stats.count,
        revenue_cents: stats.revenue 
      }))
      .sort((a, b) => b.purchase_date.localeCompare(a.purchase_date))
      .slice(0, 30);

    // === COMBINED ANALYTICS ===
    // Check for discrepancies
    const discrepancies = {
      purchasesWithoutDownloads: 0,
      downloadsWithoutPurchases: 0
    };

    // This is a simplified check - in production you'd want more sophisticated correlation
    const downloadEmails = new Set(uniqueData?.map(d => d.customer_email).filter(Boolean));
    const purchaseCustomers = new Set(purchaseData?.map(p => p.buyer_id).filter(Boolean));
    
    discrepancies.purchasesWithoutDownloads = purchaseCustomers.size - downloadEmails.size;
    discrepancies.downloadsWithoutPurchases = downloadEmails.size - purchaseCustomers.size;

    return Response.json({
      // Download metrics
      totalDownloads: totalData?.length || 0,
      uniqueDownloadCustomers,
      bookBreakdown,
      recentDownloads: recentData || [],
      dailyDownloadStats: dailyDownloadData,
      
      // Purchase metrics
      totalPurchases,
      totalRevenueCents: totalRevenue,
      uniquePurchaseCustomers,
      purchaseBreakdown: Object.entries(purchaseBreakdown).map(([type, stats]) => ({
        download_type: type,
        purchases: stats.count,
        revenue_cents: stats.revenue
      })),
      dailyPurchaseStats: dailyPurchaseData,
      
      // Health metrics
      discrepancies
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
