import { NextRequest, NextResponse } from 'next/server';

export interface PolymarketMarket {
  condition_id: string;
  question: string;
  description?: string;
  end_date_iso: string;
  game_start_time?: string;
  seconds_delay?: number;
  fpmm?: string;
  market_slug?: string;
  min_bet_amount?: string;
  min_tick_size?: string;
  neg_risk?: boolean;
  question_id: string;
  tags: string[];
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity?: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  slug: string;
  resolutionSource?: string;
  endDate: string;
  startDate?: string;
  image?: string;
  icon?: string;
  groupItemTitle?: string;
  groupItemThreshold?: number;
  volume24hr?: string;
}

const POLYMARKET_API_BASE = 'https://clob.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const active = searchParams.get('active') || 'true';
    const closed = searchParams.get('closed') || 'false';
    const tag = searchParams.get('tag') || '';
    const search = searchParams.get('search') || '';

    // Build the API URL
    const apiUrl = new URL(`${POLYMARKET_API_BASE}/markets`);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('active', active);
    apiUrl.searchParams.set('closed', closed);
    
    if (tag) {
      apiUrl.searchParams.set('tag', tag);
    }
    
    if (search) {
      apiUrl.searchParams.set('search', search);
    }

    console.log('Fetching from:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });

    if (!response.ok) {
      console.error('Polymarket API error:', response.status, response.statusText);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    
    // Handle different response formats
    let marketsArray = [];
    if (Array.isArray(data)) {
      marketsArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      marketsArray = data.data;
    } else if (data.markets && Array.isArray(data.markets)) {
      marketsArray = data.markets;
    } else {
      console.warn('Unexpected API response format:', data);
      marketsArray = [];
    }
    
    // Transform the data to match our frontend interface
    const transformedData = {
      markets: marketsArray.map((market: any) => ({
        id: market.condition_id || market.id || `market-${Date.now()}-${Math.random()}`,
        name: market.question || market.title || market.name || 'Unknown Market',
        description: market.description || market.question || market.title || 'No description available',
        category: (market.tags && market.tags[0]) || market.category || 'Other',
        currentPrice: market.outcomePrices ? parseFloat(market.outcomePrices[0]) : (market.price ? parseFloat(market.price) : 0.5),
        priceChange24h: market.priceChange24hr ? parseFloat(market.priceChange24hr) : (Math.random() * 0.2 - 0.1), // Random for demo
        volume24h: market.volume24hr ? parseFloat(market.volume24hr) : (market.volume ? parseFloat(market.volume) : Math.random() * 100000),
        liquidity: market.liquidity ? parseFloat(market.liquidity) : Math.random() * 500000,
        endDate: market.end_date_iso || market.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        probability: market.outcomePrices ? Math.round(parseFloat(market.outcomePrices[0]) * 100) : Math.round(Math.random() * 100),
        isWatched: false,
        active: market.active !== false,
        closed: market.closed === true,
        outcomes: market.outcomes || ['Yes', 'No'],
        slug: market.market_slug || market.slug || market.id || 'unknown-market',
        tags: market.tags || [market.category || 'Other'],
        image: market.image,
        icon: market.icon,
      })),
      total: marketsArray.length,
    };

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error fetching markets:', error);
    
    // Return mock data as fallback
    const mockData = {
      markets: [
        {
          id: 'mock-1',
          name: 'Will Bitcoin reach $100k by end of 2025?',
          description: 'Bitcoin price prediction for end of year 2025',
          category: 'Crypto',
          currentPrice: 0.65,
          priceChange24h: 0.05,
          volume24h: 125000,
          liquidity: 890000,
          endDate: '2025-12-31T23:59:59Z',
          probability: 65,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'bitcoin-100k-2025',
          tags: ['crypto', 'bitcoin'],
        },
        {
          id: 'mock-2',
          name: 'Tesla stock above $300 by Q2 2025?',
          description: 'Tesla stock price prediction for Q2 2025',
          category: 'Stocks',
          currentPrice: 0.42,
          priceChange24h: -0.03,
          volume24h: 89000,
          liquidity: 650000,
          endDate: '2025-06-30T23:59:59Z',
          probability: 42,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'tesla-300-q2-2025',
          tags: ['stocks', 'tesla'],
        },
      ],
      total: 2,
    };

    return NextResponse.json(mockData, {
      status: error instanceof Error ? 500 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}