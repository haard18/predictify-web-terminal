import { useState, useEffect, useCallback } from 'react';
import { polymarketAPI, type PolymarketMarket, type MarketFilters } from '@/lib/polymarket-api';

interface UsePolymarketResult {
  markets: PolymarketMarket[];
  loading: boolean;
  error: string | null;
  total: number;
  categories: string[];
  fetchMarkets: (filters?: MarketFilters) => Promise<void>;
  refreshMarkets: () => Promise<void>;
}

export function usePolymarket(initialFilters: MarketFilters = {}): UsePolymarketResult {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  const fetchMarkets = useCallback(async (filters: MarketFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const newFilters = { ...currentFilters, ...filters };
      setCurrentFilters(newFilters);
      
      console.log('Fetching markets with filters:', newFilters);
      
      const response = await polymarketAPI.getMarkets(newFilters);
      
      console.log('Received markets response:', response);
      
      setMarkets(response.markets);
      setTotal(response.total);
      
      // Fetch categories if we haven't yet
      if (categories.length === 0) {
        try {
          const fetchedCategories = await polymarketAPI.getCategories();
          setCategories(fetchedCategories);
        } catch (categoryError) {
          console.warn('Failed to fetch categories:', categoryError);
          setCategories(['Crypto', 'Politics', 'Sports', 'Economics', 'Tech']);
        }
      }
      
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      
      // Set fallback data
      setMarkets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, categories.length]);

  const refreshMarkets = useCallback(() => {
    return fetchMarkets(currentFilters);
  }, [fetchMarkets, currentFilters]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMarkets(initialFilters);
  }, []); // Only run on mount

  return {
    markets,
    loading,
    error,
    total,
    categories,
    fetchMarkets,
    refreshMarkets,
  };
}