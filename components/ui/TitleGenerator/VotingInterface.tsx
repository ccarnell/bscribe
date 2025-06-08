'use client';

import React, { useState, useEffect } from 'react';
import TitleCard from './TitleCard';
import Button from '@/components/ui/Button';

interface Title {
  id: string;
  title: string;
  subtitle: string;
  generated_at: string;
  vote_count: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VotingInterface() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');
  const [votedTitles, setVotedTitles] = useState<Set<string>>(new Set());

  // Load voted titles from localStorage on initial render
  useEffect(() => {
    const savedVotes = localStorage.getItem('bscribe_voted_titles');
    if (savedVotes) {
      setVotedTitles(new Set(JSON.parse(savedVotes)));
    }
    
    fetchTitles();
  }, []);

  // Fetch titles when filters change
  useEffect(() => {
    fetchTitles();
  }, [timeFilter, sortBy, pagination.page]);

  const fetchTitles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/user-titles/list?page=${pagination.page}&limit=${pagination.limit}&timeFilter=${timeFilter}&sortBy=${sortBy}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch titles');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setTitles(data.titles);
      setPagination(data.pagination);
      
    } catch (err) {
      setError('Failed to load titles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (titleId: string) => {
    try {
      const response = await fetch('/api/user-titles/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ titleId })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to vote');
      }
      
      // Update titles list with vote count from server response
      setTitles(titles.map(title => {
        if (title.id === titleId) {
          return {
            ...title,
            // Use the vote_count from the server response if available, otherwise calculate it
            vote_count: data.vote_count !== undefined ? data.vote_count : 
                        (data.voted ? title.vote_count + 1 : Math.max(0, title.vote_count - 1))
          };
        }
        return title;
      }));
      
      // Update voted titles in state and localStorage
      const newVotedTitles = new Set(votedTitles);
      if (data.voted) {
        newVotedTitles.add(titleId);
      } else {
        newVotedTitles.delete(titleId);
      }
      
      setVotedTitles(newVotedTitles);
      localStorage.setItem('bscribe_voted_titles', JSON.stringify([...newVotedTitles]));
      
    } catch (err) {
      console.error('Vote error:', err);
      // No need to show error to user for votes
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({
        ...pagination,
        page: pagination.page - 1
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination({
        ...pagination,
        page: pagination.page + 1
      });
    }
  };

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <div className="text-sm text-gray-400 flex items-center">Time:</div>
          <div className="flex space-x-1">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded text-sm ${
                  timeFilter === filter
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]'
                }`}
              >
                {filter === 'today' ? 'Today' : 
                 filter === 'week' ? 'This Week' : 
                 filter === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="text-sm text-gray-400 flex items-center">Sort by:</div>
          <div className="flex space-x-1">
            {(['recent', 'votes'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 rounded text-sm ${
                  sortBy === sort
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]'
                }`}
              >
                {sort === 'recent' ? 'Most Recent' : 'Most Votes'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Titles Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
            <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
            <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      ) : titles.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
          <p className="text-gray-300">No titles found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {titles.map((title) => (
            <TitleCard
              key={title.id}
              id={title.id}
              title={title.title}
              subtitle={title.subtitle}
              generatedAt={title.generated_at}
              voteCount={title.vote_count}
              isVoted={votedTitles.has(title.id)}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {!loading && titles.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handlePrevPage}
              disabled={pagination.page <= 1}
              variant="slim"
              className="px-4 py-2"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages}
              variant="slim"
              className="px-4 py-2"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}