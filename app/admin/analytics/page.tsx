'use client';

import { useState, useEffect } from 'react';

interface DownloadStats {
  totalDownloads: number;
  uniqueCustomers: number;
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
  dailyStats: Array<{
    download_date: string;
    downloads: number;
  }>;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DownloadStats | null>(null);
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

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📊 BScribe Analytics</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-emerald-100">Total Downloads</h2>
            <p className="text-4xl font-black text-emerald-300">{stats.totalDownloads}</p>
          </div>
          
          <div className="bg-blue-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-100">Unique Customers</h2>
            <p className="text-4xl font-black text-blue-300">{stats.uniqueCustomers}</p>
          </div>
        </div>

        {/* Book Breakdown */}
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

        {/* Recent Downloads */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
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

        {/* Daily Stats */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Daily Downloads</h2>
          <div className="space-y-2">
            {stats.dailyStats.slice(0, 7).map((day, i) => (
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