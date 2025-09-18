'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SortAsc, SortDesc, Grid, List, Eye, RefreshCw, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import MarketCard from '../shared/MarketCard';
import FilterPanel, { type FilterOptions } from '../shared/FilterPanel';
import { useMarkets, useWatchlist } from '@/hooks/useMarkets';
import type { Market } from '../types';
import type { MarketFilters } from '@/lib/polymarket-api';

type SortOption = 'volume' | 'liquidity' | 'activity' | 'price-change';
type ViewMode = 'grid' | 'list';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    volumeRange: [0, 1000000],
    liquidityRange: [0, 2000000],
    priceRange: [0, 1],
    resolutionTime: 'all',
  });

  // Use the markets hook for live data
  const { markets, loading, error, categories, fetchMarkets, searchMarkets, refreshMarkets } = useMarkets({
    autoFetch: true,
    initialFilters: { active: true, limit: 50, order: 'volume24hr' }
  });

  // Use watchlist hook
  const { isWatched, toggleWatch } = useWatchlist();

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

  // Add markets to watchlist and update the displayed markets
  const marketsWithWatchStatus = useMemo(() => {
    return markets.map(market => ({
      ...market,
      isWatched: isWatched(market.id)
    }));
  }, [markets, isWatched]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMarkets(searchQuery);
      } else {
        refreshMarkets();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMarkets, refreshMarkets]);

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    let filtered = marketsWithWatchStatus.filter(market => {
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
  }, [marketsWithWatchStatus, filters, sortBy, sortDirection]);

  const handleToggleWatch = (marketId: string) => {
    toggleWatch(marketId);
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

  const handleRefresh = async () => {
    await refreshMarkets();
  };

  const handleFiltersChange = async (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Convert our filter format to Polymarket API format
    const apiFilters: MarketFilters = {
      active: true,
      limit: 50,
      order: 'volume24hr',
    };

    if (newFilters.categories.length > 0) {
      // For Polymarket, we might need to fetch each category separately
      // or use a different approach depending on their API
      apiFilters.category = newFilters.categories[0]; // Use first category for now
    }

    if (newFilters.volumeRange[1] < 1000000) {
      apiFilters.volume_min = newFilters.volumeRange[0];
    }

    if (newFilters.liquidityRange[1] < 2000000) {
      apiFilters.liquidity_min = newFilters.liquidityRange[0];
    }

    await fetchMarkets(apiFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Markets
        </h1>
        <p className="text-gray-400">
          Explore live prediction markets from Polymarket
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={clsx(
              'flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              )}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Status */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          <Filter size={16} />
          <span>Filters</span>
          {filters.categories.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {filters.categories.length}
            </span>
          )}
        </button>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          {loading && (
            <span className="flex items-center space-x-2">
              <RefreshCw size={14} className="animate-spin" />
              <span>Loading...</span>
            </span>
          )}
          {error && (
            <span className="text-red-400">Error: {error}</span>
          )}
          <span>{filteredAndSortedMarkets.length} markets found</span>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            className="bg-gray-800 border-gray-600"
          />
        </div>
      )}

      {/* Markets Display */}
      {viewMode === 'list' ? (
        // Table View (like in the image)
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-750 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <div className="col-span-2 cursor-pointer" onClick={() => handleSort('volume')}>
              Market {sortBy === 'volume' && (sortDirection === 'desc' ? '↓' : '↑')}
            </div>
            <div className="text-center cursor-pointer" onClick={() => handleSort('price-change')}>
              Price {sortBy === 'price-change' && (sortDirection === 'desc' ? '↓' : '↑')}
            </div>
            <div className="text-center cursor-pointer" onClick={() => handleSort('price-change')}>
              1h Change {sortBy === 'price-change' && (sortDirection === 'desc' ? '↓' : '↑')}
            </div>
            <div className="text-center cursor-pointer" onClick={() => handleSort('volume')}>
              Volume {sortBy === 'volume' && (sortDirection === 'desc' ? '↓' : '↑')}
            </div>
            <div className="text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-700">
            {filteredAndSortedMarkets.length === 0 ? (
              <div className="text-center py-12">
                {loading ? (
                  <div className="text-gray-500 mb-4">
                    <RefreshCw size={48} className="mx-auto animate-spin" />
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4">
                    <Search size={48} className="mx-auto" />
                  </div>
                )}
                <h3 className="text-lg font-medium text-white mb-2">
                  {loading ? 'Loading markets...' : 'No markets found'}
                </h3>
                <p className="text-gray-400">
                  {loading ? 'Fetching live data from Polymarket' : 'Try adjusting your search query or filters'}
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
                      ${formatCurrency(market.volume24h)}
                    </p>
                  </div>

                  {/* Status + Actions */}
                  <div className="text-center flex items-center justify-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                      active
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatch(market.id);
                      }}
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
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onToggleWatch={handleToggleWatch}
              onTrade={handleTrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
