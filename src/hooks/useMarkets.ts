'use client';

import { useState, useEffect, useCallback } from 'react';
import { polymarketAPI, convertPolymarketToMarket, type MarketFilters } from '@/lib/polymarket-api';
import type { Market } from '@/components/types';

export interface UseMarketsOptions {
  autoFetch?: boolean;
  initialFilters?: MarketFilters;
}

export interface UseMarketsReturn {
  markets: Market[];
  loading: boolean;
  error: string | null;
  categories: string[];
  fetchMarkets: (filters?: MarketFilters) => Promise<void>;
  searchMarkets: (query: string) => Promise<void>;
  refreshMarkets: () => Promise<void>;
  getTrendingMarkets: () => Promise<void>;
}

export function useMarkets(options: UseMarketsOptions = {}): UseMarketsReturn {
  const { autoFetch = true, initialFilters = {} } = options;
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<MarketFilters>(initialFilters);

  // Fetch markets with current filters using Gamma API
  const fetchMarkets = useCallback(async (filters: MarketFilters = currentFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await polymarketAPI.getMarkets({
        active: true, // Only get active markets
        closed: false, // Exclude closed markets
        limit: 50, // Gamma API should already filter properly
        order: 'volume24hr',
        ...filters,
      });
      
      // Convert to our internal Market type
      const convertedMarkets = response.markets.map(convertPolymarketToMarket);
      
      // Gamma API should already filter properly, but add minimal client-side validation
      const validMarkets = convertedMarkets.filter(market => {
        const now = new Date();
        const endDate = new Date(market.endDate);
        
        return (
          market.active === true &&           // Market is active
          market.closed === false &&          // Market is not closed
          endDate > now                       // End date is in the future
        );
      });
      
      setMarkets(validMarkets);
      setCurrentFilters(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
      setError(errorMessage);
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  // Search markets by query
  const searchMarkets = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchMarkets();
    }
    
    await fetchMarkets({ ...currentFilters, search: query });
  }, [fetchMarkets, currentFilters]);

  // Refresh current markets
  const refreshMarkets = useCallback(async () => {
    await fetchMarkets(currentFilters);
  }, [fetchMarkets, currentFilters]);

  // Get trending markets
  const getTrendingMarkets = useCallback(async () => {
    await fetchMarkets({
      active: true,
      order: 'volume24hr',
      limit: 20,
    });
  }, [fetchMarkets]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await polymarketAPI.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use fallback categories
        setCategories(['Sports', 'Politics', 'Crypto', 'Economics', 'Pop Culture', 'Science', 'Other']);
      }
    };

    fetchCategories();
  }, []);

  // Auto-fetch markets on mount
  useEffect(() => {
    if (autoFetch) {
      fetchMarkets();
    }
  }, [autoFetch, fetchMarkets]);

  return {
    markets,
    loading,
    error,
    categories,
    fetchMarkets,
    searchMarkets,
    refreshMarkets,
    getTrendingMarkets,
  };
}

// Hook for managing watchlist (using localStorage for now)
export function useWatchlist() {
  const [watchedMarkets, setWatchedMarkets] = useState<Set<string>>(new Set());

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('polymarket-watchlist');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWatchedMarkets(new Set(parsed));
      } catch (err) {
        console.error('Error loading watchlist:', err);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('polymarket-watchlist', JSON.stringify(Array.from(watchedMarkets)));
  }, [watchedMarkets]);

  const toggleWatch = useCallback((marketId: string) => {
    setWatchedMarkets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  }, []);

  const isWatched = useCallback((marketId: string) => {
    return watchedMarkets.has(marketId);
  }, [watchedMarkets]);

  const getWatchedMarkets = useCallback(() => {
    return Array.from(watchedMarkets);
  }, [watchedMarkets]);

  return {
    watchedMarkets: Array.from(watchedMarkets),
    toggleWatch,
    isWatched,
    getWatchedMarkets,
  };
}
