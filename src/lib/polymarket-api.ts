// Polymarket API integration using Next.js API routes to avoid CORS

// Types for our internal market format
export interface PolymarketMarket {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  endDate: string;
  probability: number;
  isWatched?: boolean;
  active: boolean;
  closed: boolean;
  outcomes: string[];
  slug: string;
  tags: string[];
  image?: string;
  icon?: string;
}

export interface MarketsResponse {
  markets: PolymarketMarket[];
  total: number;
}

export interface MarketFilters {
  active?: boolean;
  closed?: boolean;
  category?: string;
  tags?: string[];
  liquidity_min?: number;
  volume_min?: number;
  order?: 'volume24hr' | 'liquidity' | 'newest' | 'ending_soonest';
  limit?: number;
  offset?: number;
  search?: string;
}

// API client class
class PolymarketAPI {
  private baseUrl = '/api/markets'; // Use our Next.js API route

  /**
   * Fetch markets with optional filters
   */
  async getMarkets(filters: MarketFilters = {}): Promise<MarketsResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.closed !== undefined) params.append('closed', filters.closed.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      if (filters.search) params.append('search', filters.search);
      
      // Convert category to tag for Polymarket API
      if (filters.category && filters.category !== 'all') {
        params.append('tag', filters.category.toLowerCase());
      }

      const url = `${this.baseUrl}?${params.toString()}`;
      console.log('Fetching markets from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching markets:', error);
      
      // Return empty result on error
      return {
        markets: [],
        total: 0,
      };
    }
  }

  /**
   * Get a specific market by ID
   */
  async getMarket(marketId: string): Promise<PolymarketMarket | null> {
    try {
      const response = await this.getMarkets({ search: marketId, limit: 1 });
      return response.markets[0] || null;
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }

  /**
   * Get market categories from the fetched markets
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.getMarkets({ limit: 100 });
      const allTags = response.markets.flatMap(market => market.tags);
      const categories = [...new Set(allTags)].sort();
      return categories.length > 0 ? categories : ['Crypto', 'Politics', 'Sports', 'Economics', 'Tech'];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Crypto', 'Politics', 'Sports', 'Economics', 'Tech'];
    }
  }

  /**
   * Get trending markets (high volume/activity)
   */
  async getTrendingMarkets(limit: number = 20): Promise<PolymarketMarket[]> {
    try {
      const response = await this.getMarkets({
        active: true,
        limit,
      });
      
      // Sort by volume for trending
      return response.markets.sort((a, b) => b.volume24h - a.volume24h);
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      return [];
    }
  }

  /**
   * Search markets by query
   */
  async searchMarkets(query: string, limit: number = 50): Promise<PolymarketMarket[]> {
    try {
      const response = await this.getMarkets({
        search: query,
        active: true,
        limit,
      });
      return response.markets;
    } catch (error) {
      console.error('Error searching markets:', error);
      return [];
    }
  }
}

// Export singleton instance
export const polymarketAPI = new PolymarketAPI();

// Import the Market type from our types
import type { Market } from '@/components/types';

// Utility function to convert our PolymarketMarket to the legacy Market type
export function convertPolymarketToMarket(polyMarket: PolymarketMarket): Market {
  return {
    id: polyMarket.id,
    name: polyMarket.name,
    description: polyMarket.description,
    category: polyMarket.category,
    currentPrice: polyMarket.currentPrice,
    priceChange24h: polyMarket.priceChange24h,
    volume24h: polyMarket.volume24h,
    liquidity: polyMarket.liquidity,
    endDate: polyMarket.endDate,
    probability: polyMarket.probability,
    isWatched: polyMarket.isWatched || false,
  };
}
