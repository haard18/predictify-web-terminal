'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Filter, X, ChevronDown } from 'lucide-react';

export interface FilterOptions {
  categories: string[];
  volumeRange: [number, number];
  liquidityRange: [number, number];
  priceRange: [number, number];
  resolutionTime: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  className?: string;
}

export default function FilterPanel({ 
  filters, 
  onFiltersChange, 
  categories,
  className 
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleRangeChange = (
    type: 'volumeRange' | 'liquidityRange' | 'priceRange',
    index: 0 | 1,
    value: number
  ) => {
    const newRange = [...filters[type]] as [number, number];
    newRange[index] = value;
    onFiltersChange({ ...filters, [type]: newRange });
  };

  const resetFilters = () => {
    onFiltersChange({
      categories: [],
      volumeRange: [0, 1000000],
      liquidityRange: [0, 2000000],
      priceRange: [0, 1],
      resolutionTime: 'all',
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.volumeRange[0] > 0 ||
    filters.volumeRange[1] < 1000000 ||
    filters.liquidityRange[0] > 0 ||
    filters.liquidityRange[1] < 2000000 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1 ||
    filters.resolutionTime !== 'all';

  return (
    <div className={clsx('bg-gray-800 border border-gray-600 rounded-lg', className)}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <h3 className="font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={clsx(
            'transform transition-transform duration-200 text-gray-400',
            isExpanded ? 'rotate-180' : ''
          )}
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-600 pt-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categories
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-left hover:bg-gray-600"
              >
                <span className="text-sm">
                  {filters.categories.length === 0 
                    ? 'All Categories' 
                    : `${filters.categories.length} selected`
                  }
                </span>
                <ChevronDown size={16} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center px-3 py-2 hover:bg-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2 rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-white">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volume Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Volume Range (24h)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.volumeRange[0]}
                onChange={(e) => handleRangeChange('volumeRange', 0, Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.volumeRange[1]}
                onChange={(e) => handleRangeChange('volumeRange', 1, Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liquidity Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Liquidity Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.liquidityRange[0]}
                onChange={(e) => handleRangeChange('liquidityRange', 0, Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.liquidityRange[1]}
                onChange={(e) => handleRangeChange('liquidityRange', 1, Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Resolution Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution Time
            </label>
            <select
              value={filters.resolutionTime}
              onChange={(e) => onFiltersChange({ ...filters, resolutionTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="24h">Next 24 Hours</option>
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
              <option value="90d">Next 90 Days</option>
              <option value="1y">Next Year</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Reset
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
