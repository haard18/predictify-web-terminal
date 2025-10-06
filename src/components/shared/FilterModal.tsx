'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  liquidityRange: {
    min: number;
    max: number;
  };
  searchKeywords: string[];
  sortBy: 'volume' | 'liquidity' | 'newest' | 'ending_soonest';
  showActiveOnly: boolean;
}

const categories = [
  { 
    id: 'crypto', 
    name: 'Crypto', 
    color: '#F97316', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.568l-1.136 1.136L12 14.272l-4.432 4.432-1.136-1.136L10.864 13.136H8V11.136h3.568L7.136 6.704l1.136-1.136L12 9.136l3.728-3.568 1.136 1.136-4.432 4.432H16v2h-2.864l4.432 4.432z"/>
      </svg>
    )
  },
  { 
    id: 'politics', 
    name: 'Politics', 
    color: '#8B5CF6', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3.09 8.26l1.35 11.74h15.12l1.35-11.74L12 2zm-1.5 15.5h-1.8L8.4 16h1.6l.5 1.5zm0-3h-1.8L8.4 13h1.6l.5 1.5zm3 3h-1.8L11.4 16h1.6l.5 1.5zm0-3h-1.8L11.4 13h1.6l.5 1.5z"/>
      </svg>
    )
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    color: '#10B981', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    )
  },
  { 
    id: 'tech', 
    name: 'Technology', 
    color: '#06B6D4', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    color: '#EC4899', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
      </svg>
    )
  },
  { 
    id: 'health', 
    name: 'Health', 
    color: '#059669', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  },
  { 
    id: 'world', 
    name: 'World Events', 
    color: '#6366F1', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    )
  },
  { 
    id: 'economics', 
    name: 'Economics', 
    color: '#EAB308', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>
    )
  },
  { 
    id: 'climate', 
    name: 'Climate', 
    color: '#14B8A6', 
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
      </svg>
    )
  },
];

export default function FilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  if (!isOpen) return null;

  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAddSearchKeyword = () => {
    if (searchKeyword.trim() && !filters.searchKeywords.includes(searchKeyword.trim())) {
      setFilters(prev => ({
        ...prev,
        searchKeywords: [...prev.searchKeywords, searchKeyword.trim()]
      }));
      setSearchKeyword('');
    }
  };

  const handleRemoveSearchKeyword = (keyword: string) => {
    setFilters(prev => ({
      ...prev,
      searchKeywords: prev.searchKeywords.filter(k => k !== keyword)
    }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 100 },
      liquidityRange: { min: 0, max: 10000000 },
      searchKeywords: [],
      sortBy: 'volume',
      showActiveOnly: true
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleUnselectAll = () => {
    setFilters(prev => ({ ...prev, categories: [] }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out" 
        onClick={onClose} 
        style={{ backdropFilter: 'blur(8px)' }}
      />
      
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-96 bg-gradient-to-b from-[#0d1117] to-[#161b22] border-l border-[#30363d] shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] opacity-50"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-[#30363d] backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse"></div>
              <h2 className="text-xl font-bold text-[#f0f6fc] tracking-tight">Advanced Filters</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="p-2 text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded-lg transition-all duration-200 hover:scale-105 group"
                title="Reset filters"
              >
                <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#7d8590] hover:text-[#f85149] hover:bg-[#30363d] rounded-lg transition-all duration-200 hover:scale-105"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto pb-16 scrollbar-thin scrollbar-track-[#0d1117] scrollbar-thumb-[#30363d] hover:scrollbar-thumb-[#7d8590]">
          {/* Categories */}
          <div className="p-6 bg-gradient-to-r from-[#0d1117]/50 to-[#161b22]/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#58a6ff] rounded-full"></div>
                <h3 className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">Categories</h3>
              </div>
              <button
                onClick={handleUnselectAll}
                className="text-xs text-[#7d8590] hover:text-[#58a6ff] transition-colors duration-200 font-medium hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    filters.categories.includes(category.id)
                      ? 'bg-gradient-to-r from-[#21262d] to-[#30363d] border-[#58a6ff] text-[#f0f6fc] shadow-lg shadow-[#58a6ff]/20'
                      : 'border-[#30363d] text-[#7d8590] hover:border-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                  }`}
                >
                  <div 
                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110" 
                    style={{ color: filters.categories.includes(category.id) ? category.color : 'currentColor' }}
                  >
                    {category.icon}
                  </div>
                  <span className="truncate font-medium">{category.name}</span>
                  {filters.categories.includes(category.id) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#58a6ff]/10 to-transparent rounded-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="p-6 border-t border-[#30363d] bg-gradient-to-r from-[#161b22]/30 to-[#0d1117]/30">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-[#10B981] rounded-full"></div>
              <h3 className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">Price Range (¢)</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590]"
                />
              </div>
              <div className="px-2">
                <span className="text-[#7d8590] font-mono text-lg">→</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590]"
                />
              </div>
            </div>
          </div>

          {/* Liquidity Range */}
          <div className="p-6 border-t border-[#30363d] bg-gradient-to-r from-[#0d1117]/30 to-[#161b22]/30">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-[#06B6D4] rounded-full"></div>
              <h3 className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">Liquidity Range ($)</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.liquidityRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    liquidityRange: { ...prev.liquidityRange, min: Number(e.target.value) }
                  }))}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590]"
                />
              </div>
              <div className="px-2">
                <span className="text-[#7d8590] font-mono text-lg">→</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.liquidityRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    liquidityRange: { ...prev.liquidityRange, max: Number(e.target.value) }
                  }))}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590]"
                />
              </div>
            </div>
          </div>

          {/* Search Keywords */}
          <div className="p-6 border-t border-[#30363d] bg-gradient-to-r from-[#161b22]/30 to-[#0d1117]/30">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-[#10B981] rounded-full"></div>
              <h3 className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">Search Keywords</h3>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                placeholder="Enter keywords to include..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSearchKeyword()}
                className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590]"
              />
              <button
                onClick={handleAddSearchKeyword}
                className="px-4 py-2.5 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white text-sm font-semibold rounded-lg hover:from-[#2ea043] hover:to-[#238636] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.searchKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#21262d] to-[#30363d] border border-[#58a6ff]/30 rounded-lg text-xs text-[#f0f6fc] font-medium shadow-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveSearchKeyword(keyword)}
                    className="ml-2 text-[#7d8590] hover:text-[#f85149] transition-colors duration-150 hover:scale-110"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="p-6 border-t border-[#30363d] bg-gradient-to-r from-[#161b22]/30 to-[#0d1117]/30">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-[#EAB308] rounded-full"></div>
              <h3 className="text-sm font-bold text-[#f0f6fc] uppercase tracking-wider">Sort By</h3>
            </div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                sortBy: e.target.value as FilterOptions['sortBy']
              }))}
              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200 hover:border-[#7d8590] cursor-pointer"
            >
              <option value="volume">Volume (24h)</option>
              <option value="liquidity">Liquidity</option>
              <option value="newest">Newest</option>
              <option value="ending_soonest">Ending Soonest</option>
            </select>
          </div>

          {/* Active Only Toggle */}
          <div className="p-6 border-t border-[#30363d] bg-gradient-to-r from-[#0d1117]/30 to-[#161b22]/30">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.showActiveOnly}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    showActiveOnly: e.target.checked
                  }))}
                  className="w-5 h-5 text-[#58a6ff] bg-[#0d1117] border-2 border-[#30363d] rounded-md focus:ring-[#58a6ff] focus:ring-2 transition-all duration-200 group-hover:border-[#58a6ff]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#10B981] rounded-full"></div>
                <span className="text-sm font-medium text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors duration-200">Show Active Markets Only</span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d1117] via-[#161b22] to-transparent z-10">
          <div className="p-4 border-t border-[#30363d] backdrop-blur-sm">
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[#30363d] text-[#f0f6fc] bg-[#21262d] rounded-md hover:bg-[#30363d] hover:border-[#7d8590] transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white rounded-md hover:from-[#2ea043] hover:to-[#238636] transition-all duration-200 text-sm font-medium shadow-md shadow-[#238636]/20 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-[#238636]/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}