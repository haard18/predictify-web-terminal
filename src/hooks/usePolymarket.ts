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
      
      // Ensure we only get active, non-closed markets from Gamma API
      const newFilters = { 
        active: true,
        closed: false,
        ...currentFilters, 
        ...filters 
      };
      setCurrentFilters(newFilters);
      
      console.log('Fetching markets from Gamma API with filters:', newFilters);
      
      const response = await polymarketAPI.getMarkets(newFilters);
      
      console.log('Received Gamma API markets response:', response);
      
      // Filter markets client-side for extra safety
      const validMarkets = response.markets.filter(market => {
        const endDate = new Date(market.endDate);
        const now = new Date();
        return market.active && !market.closed && endDate > now;
      });
      
      setMarkets(validMarkets);
      setTotal(validMarkets.length);
      
      // Fetch categories if we haven't yet
      if (categories.length === 0) {
        try {
          const fetchedCategories = await polymarketAPI.getCategories();
          setCategories(fetchedCategories);
        } catch (categoryError) {
          console.warn('Failed to fetch categories:', categoryError);
          setCategories(['Sports', 'Politics', 'Crypto', 'Economics', 'Entertainment', 'Health', 'Technology', 'Other']);
        }
      }
      
    } catch (err) {
      console.error('Error fetching markets from Gamma API:', err);
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