'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface TitleSlotProps {
  index: number;
  title: string | null;
  subtitle: string | null;
  apiCallsUsed: number;
  maxApiCalls: number;
  selected: boolean;
  onGenerate: (index: number) => void;
  onSelect: (index: number, selected: boolean) => void;
  loading: boolean;
  loadingSlot: number | null;
}

export default function TitleSlot({
  index,
  title,
  subtitle,
  apiCallsUsed,
  maxApiCalls,
  selected,
  onGenerate,
  onSelect,
  loading,
  loadingSlot
}: TitleSlotProps) {
  const isLoading = loading && loadingSlot === index;
  const isMaxed = apiCallsUsed >= maxApiCalls;
  const isEmpty = !title && !subtitle;

  const handleGenerate = () => {
    onGenerate(index);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(index, e.target.checked);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold">Slot {index + 1}</h3>
        <div className={`text-sm ${isMaxed ? 'text-red-400' : 'text-gray-300'}`}>
          {apiCallsUsed}/{maxApiCalls} API calls used
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-[#2d2d2d] p-6 rounded-lg mb-4 text-center">
          <p className="text-gray-400">No title generated yet</p>
        </div>
      ) : (
        <div className="bg-[#2d2d2d] p-6 rounded-lg mb-4">
          <h4 className="text-white font-bold mb-2">{title}</h4>
          <p className="text-gray-300 text-sm">{subtitle}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          onClick={handleGenerate}
          loading={isLoading}
          disabled={isMaxed || isLoading}
          variant={isEmpty ? "emerald" : "slim"}
          className="px-4 py-2"
        >
          {isEmpty ? "Generate" : "Regenerate"}
        </Button>

        {!isEmpty && (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleSelect}
              className="h-5 w-5 rounded border-gray-600 bg-[#2d2d2d] text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-gray-300">Submit for voting</span>
          </label>
        )}
      </div>
    </div>
  );
}