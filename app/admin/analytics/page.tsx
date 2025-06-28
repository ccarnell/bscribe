'use client';

import { useState, useEffect } from 'react';

interface AnalyticsStats {
  // Download metrics
  totalDownloads: number;
  uniqueDownloadCustomers: number;
  bookBreakdown: Array<{
    book_title: string;
    downloads: number;
    unique_customers: number;
  }>;
  recentDownloads: Array<{
    book_title: string;
    customer_email: string;
    downloaded_at: string;
  }>;
  dailyDownloadStats: Array<{
    download_date: string;
    downloads: number;
  }>;
  
  // Purchase metrics
  totalPurchases: number;
  totalRevenueCents: number;
  uniquePurchaseCustomers: number;
  purchaseBreakdown: Array<{
    download_type: string;
    purchases: number;
    revenue_cents: number;
  }>;
  dailyPurchaseStats: Array<{
    purchase_date: string;
    purchases: number;
    revenue_cents: number;
  }>;
  
  // Health metrics
  discrepancies: {
    purchasesWithoutDownloads: number;
    downloadsWithoutPurchases: number;
  };
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading analytics...</div>;
  if (!stats) return <div className="p-8 text-white">Failed to load stats</div>;

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📊 BScribe Analytics</h1>
        
        {/* Health Check */}
        {(stats.discrepancies.purchasesWithoutDownloads !== 0 || stats.discrepancies.downloadsWithoutPurchases !== 0) && (
          <div className="bg-red-900 p-4 rounded-lg mb-8 border border-red-500">
            <h2 className="text-xl font-bold text-red-100 mb-2">⚠️ Data Discrepancies Detected</h2>
            <p className="text-red-200 text-sm">
              Purchases without downloads: {stats.discrepancies.purchasesWithoutDownloads} | 
              Downloads without purchases: {stats.discrepancies.downloadsWithoutPurchases}
            </p>
          </div>
        )}
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-emerald-900 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-emerald-100">Total Downloads</h2>
            <p className="text-3xl font-black text-emerald-300">{stats.totalDownloads}</p>
            <p className="text-sm text-emerald-200">{stats.uniqueDownloadCustomers} unique customers</p>
          </div>
          
          <div className="bg-blue-900 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-blue-100">Total Purchases</h2>
            <p className="text-3xl font-black text-blue-300">{stats.totalPurchases}</p>
            <p className="text-sm text-blue-200">{stats.uniquePurchaseCustomers} unique customers</p>
          </div>

          <div className="bg-purple-900 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-purple-100">Total Revenue</h2>
            <p className="text-3xl font-black text-purple-300">{formatCurrency(stats.totalRevenueCents)}</p>
            <p className="text-sm text-purple-200">
              {stats.totalPurchases > 0 ? formatCurrency(stats.totalRevenueCents / stats.totalPurchases) : '$0'} avg
            </p>
          </div>

          <div className="bg-orange-900 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-orange-100">Conversion Rate</h2>
            <p className="text-3xl font-black text-orange-300">
              {stats.totalDownloads > 0 ? ((stats.totalPurchases / stats.totalDownloads) * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-sm text-orange-200">purchases/downloads</p>
          </div>
        </div>

        {/* Purchase Breakdown */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Purchase Breakdown</h2>
          <div className="space-y-3">
            {stats.purchaseBreakdown.map((purchase, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                <div>
                  <h3 className="font-bold text-white capitalize">{purchase.download_type}</h3>
                  <p className="text-gray-400 text-sm">{formatCurrency(purchase.revenue_cents)} total revenue</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{purchase.purchases}</div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(purchase.revenue_cents / purchase.purchases)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Download Breakdown */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Downloads by Book</h2>
          <div className="space-y-3">
            {stats.bookBreakdown.map((book, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                <div>
                  <h3 className="font-bold text-white">{book.book_title}</h3>
                  <p className="text-gray-400 text-sm">{book.unique_customers} unique customers</p>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {book.downloads}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Downloads */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Recent Downloads</h2>
            <div className="space-y-2">
              {stats.recentDownloads.slice(0, 10).map((download, i) => (
                <div key={i} className="flex justify-between items-center p-2 text-sm">
                  <div>
                    <span className="text-white">{download.book_title}</span>
                    <span className="text-gray-400 ml-4">{download.customer_email}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(download.downloaded_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Purchase Stats */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Daily Purchases</h2>
            <div className="space-y-2">
              {stats.dailyPurchaseStats.slice(0, 7).map((day, i) => (
                <div key={i} className="flex justify-between items-center p-2">
                  <span className="text-white">{day.purchase_date}</span>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">{day.purchases}</div>
                    <div className="text-sm text-gray-400">{formatCurrency(day.revenue_cents)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Download Stats */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Daily Downloads</h2>
          <div className="space-y-2">
            {stats.dailyDownloadStats.slice(0, 7).map((day, i) => (
              <div key={i} className="flex justify-between items-center p-2">
                <span className="text-white">{day.download_date}</span>
                <span className="text-emerald-400 font-bold">{day.downloads}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
