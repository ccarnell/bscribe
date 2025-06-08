import { NextRequest } from 'next/server';
import { checkAdminAuth } from '@/utils/auth-helpers/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // Total downloads
    const { data: totalData } = await supabaseAdmin
      .from('download_logs')
      .select('*', { count: 'exact' });

    // Unique customers
    const { data: uniqueData } = await supabaseAdmin
      .from('download_logs')
      .select('customer_email')
      .not('customer_email', 'is', null);
    
    const uniqueCustomers = new Set(uniqueData?.map(d => d.customer_email)).size;

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
    
    // Daily stats - manual aggregation
    const { data: dailyDownloads } = await supabaseAdmin
      .from('download_logs')
      .select('downloaded_at');
    
    const dailyStats: Record<string, number> = {};
    dailyDownloads?.forEach(download => {
      const date = new Date(download.downloaded_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const dailyData = Object.entries(dailyStats)
      .map(([date, downloads]) => ({ download_date: date, downloads }))
      .sort((a, b) => b.download_date.localeCompare(a.download_date))
      .slice(0, 30);

    return Response.json({
      totalDownloads: totalData?.length || 0,
      uniqueCustomers,
      bookBreakdown: bookBreakdown,
      recentDownloads: recentData || [],
      dailyStats: dailyData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}