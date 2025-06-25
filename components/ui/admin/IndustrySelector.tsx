'use client';

import { getAllIndustries, IndustryConfig } from '@/config/industries';

interface IndustrySelectorProps {
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
  disabled?: boolean;
}

export default function IndustrySelector({ 
  selectedIndustry, 
  onIndustryChange, 
  disabled = false 
}: IndustrySelectorProps) {
  const industries = getAllIndustries();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Industry
      </label>
      <select
        value={selectedIndustry}
        onChange={(e) => onIndustryChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {industries.map((industry) => (
          <option key={industry.id} value={industry.id}>
            {industry.displayName}
          </option>
        ))}
      </select>
      {selectedIndustry && (
        <p className="text-sm text-gray-400">
          Target audience: {industries.find(i => i.id === selectedIndustry)?.targetAudience}
        </p>
      )}
    </div>
  );
}
