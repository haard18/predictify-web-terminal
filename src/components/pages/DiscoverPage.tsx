'use client';

import { useState, useMemo } from 'react';
import { Search, SortAsc, SortDesc, Grid, List, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import MarketCard from '../shared/MarketCard';
import FilterPanel, { type FilterOptions } from '../shared/FilterPanel';
import { mockMarkets } from '../mockData';
import type { Market } from '../types';

type SortOption = 'volume' | 'liquidity' | 'activity' | 'price-change';
type ViewMode = 'grid' | 'list';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    volumeRange: [0, 1000000],
    liquidityRange: [0, 2000000],
    priceRange: [0, 1],
    resolutionTime: 'all',
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(mockMarkets.map(market => market.category)));
  }, []);

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    let filtered = markets.filter(market => {
      // Search filter
      if (searchQuery && !market.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !market.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(market.category)) {
        return false;
      }

      // Volume filter
      if (market.volume24h < filters.volumeRange[0] || market.volume24h > filters.volumeRange[1]) {
        return false;
      }

      // Liquidity filter
      if (market.liquidity < filters.liquidityRange[0] || market.liquidity > filters.liquidityRange[1]) {
        return false;
      }

      // Price filter
      if (market.currentPrice < filters.priceRange[0] || market.currentPrice > filters.priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'liquidity':
          aValue = a.liquidity;
          bValue = b.liquidity;
          break;
        case 'activity':
          aValue = a.volume24h + a.liquidity;
          bValue = b.volume24h + b.liquidity;
          break;
        case 'price-change':
          aValue = a.priceChange24h;
          bValue = b.priceChange24h;
          break;
        default:
          return 0;
      }

      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [markets, searchQuery, filters, sortBy, sortDirection]);

  const handleToggleWatch = (marketId: string) => {
    setMarkets(prev => prev.map(market => 
      market.id === marketId 
        ? { ...market, isWatched: !market.isWatched }
        : market
    ));
  };

  const handleTrade = (marketId: string) => {
    console.log('Trade clicked for market:', marketId);
    // In a real app, this would open a trading modal or navigate to trading page
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Markets
        </h1>
        <p className="text-gray-400">
          Explore trending prediction markets and find new opportunities
        </p>
      </div>

      {/* Filters button */}
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <span>🔽</span>
          <span>Filters</span>
        </button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{filteredAndSortedMarkets.length} markets found</span>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-750 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-2">Market ↑</div>
          <div className="text-center">Price ↓</div>
          <div className="text-center">1h Change ↓</div>
          <div className="text-center">Volume ↓</div>
          <div className="text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {filteredAndSortedMarkets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No markets found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search query or filters
              </p>
            </div>
          ) : (
            filteredAndSortedMarkets.map((market) => (
              <div key={market.id} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-750 transition-colors group cursor-pointer">
                {/* Market Name + Chart */}
                <div className="col-span-2 flex items-center space-x-3">
                  <div className="w-12 h-8 bg-gray-700 rounded flex items-end justify-center space-x-px p-1">
                    {/* Mini sparkline */}
                    {[3, 5, 2, 7, 4, 6, 8].map((height, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'w-1 rounded-t-sm',
                          market.priceChange24h >= 0 ? 'bg-green-500' : 'bg-red-500'
                        )}
                        style={{ height: `${height * 2}px` }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                      {market.name}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {market.category}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  <p className="text-white font-medium">
                    {market.currentPrice.toFixed(2)}¢
                  </p>
                </div>

                {/* 1h Change */}
                <div className="text-center">
                  <span className={clsx(
                    'font-medium',
                    market.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {market.priceChange24h >= 0 ? '+' : ''}{formatPercentage(market.priceChange24h)}
                  </span>
                </div>

                {/* Volume */}
                <div className="text-center">
                  <p className="text-gray-300">
                    {formatCurrency(market.volume24h)}
                  </p>
                </div>

                {/* Status + Actions */}
                <div className="text-center flex items-center justify-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                    active
                  </span>
                  <button
                    onClick={() => handleToggleWatch(market.id)}
                    className={clsx(
                      'p-1 rounded transition-colors duration-200',
                      market.isWatched
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-500 hover:text-yellow-400'
                    )}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
