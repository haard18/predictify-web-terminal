'use client';

import { useState } from 'react';
import { Star, Plus, Trash2, Grid, List, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import MarketCard from '../shared/MarketCard';
import { mockMarkets } from '../mockData';
import type { Market } from '../types';

type ViewMode = 'grid' | 'list';

export default function WatchlistPage() {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  // Get only watched markets
  const watchedMarkets = markets.filter(market => market.isWatched);

  const handleToggleWatch = (marketId: string) => {
    setMarkets(prev => prev.map(market => 
      market.id === marketId 
        ? { ...market, isWatched: !market.isWatched }
        : market
    ));
    // Remove from selection if unwatched
    setSelectedMarkets(prev => prev.filter(id => id !== marketId));
  };

  const handleTrade = (marketId: string) => {
    console.log('Trade clicked for market:', marketId);
  };

  const handleSelectMarket = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMarkets.length === watchedMarkets.length) {
      setSelectedMarkets([]);
    } else {
      setSelectedMarkets(watchedMarkets.map(market => market.id));
    }
  };

  const handleBulkRemove = () => {
    setMarkets(prev => prev.map(market => 
      selectedMarkets.includes(market.id)
        ? { ...market, isWatched: false }
        : market
    ));
    setSelectedMarkets([]);
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="text-gray-400 dark:text-gray-500 mb-6">
        <Star size={64} className="mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Your watchlist is empty
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Start building your personal watchlist by adding markets you want to track. 
        You can add markets from the Discover page.
      </p>
      <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
        <Plus size={16} />
        <span>Discover Markets</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Watchlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your favorite markets and stay updated on their performance
          </p>
        </div>

        {watchedMarkets.length > 0 && (
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 text-sm',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 text-sm',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {watchedMarkets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedMarkets.length === watchedMarkets.length && watchedMarkets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Select all ({watchedMarkets.length})
                  </span>
                </label>
                {selectedMarkets.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMarkets.length} selected
                  </span>
                )}
              </div>

              {selectedMarkets.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkRemove}
                    className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Markets Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {watchedMarkets.length} markets in watchlist
              </p>
            </div>

            <div className={clsx(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-4'
            )}>
              {watchedMarkets.map((market) => (
                <div key={market.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market.id)}
                      onChange={() => handleSelectMarket(market.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Market Card */}
                  <div className={clsx(
                    'ml-6',
                    selectedMarkets.includes(market.id) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                  )}>
                    <MarketCard
                      market={market}
                      onToggleWatch={handleToggleWatch}
                      onTrade={handleTrade}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
