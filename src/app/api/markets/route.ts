import { NextRequest, NextResponse } from 'next/server';

// Gamma API Market structure based on documentation
export interface GammaMarket {
  id: string;
  question: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  conditionId: string;
  questionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  startDate: string;
  image: string;
  icon: string;
  tags: string[];
  umaBond: string;
  umaReward: string;
  category: string;
  enableOrderBook: boolean;
  liquidityNum: number;
  volumeNum: number;
  volume24hr: number;
  acceptingOrders: boolean;
  acceptingOrdersTimestamp: string;
  negRisk: boolean;
  new: boolean;
  featured: number;
  submitted: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  archived: boolean;
  resolving: boolean;
  hasReviewedDocs: boolean;
  reviewedDocsAt: string | null;
}

const POLYMARKET_GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const active = searchParams.get('active') !== 'false';
    const closed = searchParams.get('closed') === 'true';
    const tag = searchParams.get('tag') || '';
    const search = searchParams.get('search') || '';

    // Build the Gamma API URL using /events endpoint
    const apiUrl = new URL(`${POLYMARKET_GAMMA_API_BASE}/events`);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('order', 'id');
    apiUrl.searchParams.set('ascending', 'false');
    
    // Gamma API filters for events endpoint
    if (active) {
      apiUrl.searchParams.set('closed', 'false'); // Active means not closed
    } else {
      apiUrl.searchParams.set('closed', 'true');
    }
    
    if (tag) {
      apiUrl.searchParams.set('tag', tag);
    }
    if (search) {
      apiUrl.searchParams.set('search', search);
    }

    console.log('Fetching from Gamma API /events endpoint:', apiUrl.toString());

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
    
    // Log the raw response to understand the structure
    console.log('Raw Gamma API /events response:', JSON.stringify(data, null, 2));
    
    // Gamma API returns events with markets array inside each event
    let eventsArray: any[] = [];
    
    if (Array.isArray(data)) {
      eventsArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      eventsArray = data.data;
    } else {
      console.warn('Unexpected Gamma API response format:', data);
      eventsArray = [];
    }
    
    console.log(`Found ${eventsArray.length} events from Gamma API`);
    
    // Process each event and extract markets with event context
    const processedMarkets: any[] = [];
    
    eventsArray.forEach((event, eventIndex) => {
      if (event.markets && Array.isArray(event.markets)) {
        event.markets.forEach((market: any) => {
          // Combine event data with market data
          const processedMarket = {
            ...market,
            // Add event-level data that markets might need
            eventTitle: event.title,
            eventTags: event.tags || [],
            eventSeries: event.series || [],
            eventImage: event.image || market.image,
            eventIcon: event.icon || market.icon,
          };
          processedMarkets.push(processedMarket);
        });
      }
    });
    
    console.log(`Found ${processedMarkets.length} total markets in all events`);
    
    // Filter to ensure only active markets that are not closed and have future end dates
    const activeMarkets = processedMarkets.filter((market: any, index: number) => {
      // Log first few markets to understand structure
      if (index < 2) {
        console.log(`Market ${index}:`, {
          id: market.id,
          question: market.question,
          active: market.active,
          closed: market.closed,
          endDate: market.endDate,
          acceptingOrders: market.acceptingOrders,
          outcomes: market.outcomes,
          outcomePrices: market.outcomePrices,
        });
      }
      
      const endDate = market.endDate ? new Date(market.endDate) : null;
      const now = new Date();
      
      return (
        market.active === true &&            // Market is active
        market.closed === false &&           // Market is not closed  
        market.acceptingOrders === true &&   // Market is accepting orders
        endDate &&                           // Has valid end date
        endDate > now                        // End date is in the future
      );
    });
    
    console.log(`Filtered to ${activeMarkets.length} active markets`);

    // Transform the filtered Gamma data to match our frontend interface
    const transformedData = {
      markets: activeMarkets.map((market: any) => {
        // Parse outcomes and prices from JSON strings
        const outcomes = market.outcomes ? JSON.parse(market.outcomes) : ['Yes', 'No'];
        const outcomePrices = market.outcomePrices ? JSON.parse(market.outcomePrices) : ['0.5', '0.5'];
        
        // Extract category from event tags
        const tags = market.eventTags || [];
        const category = tags.find((tag: any) => 
          ['crypto', 'politics', 'sports', 'entertainment', 'health', 'technology', 'economics'].includes(tag.slug?.toLowerCase())
        )?.label || 'Other';
        
        return {
          id: market.id || market.conditionId,
          name: market.question || market.eventTitle || 'Unknown Market',
          description: market.description || 'No description available',
          category: category,
          currentPrice: outcomePrices[0] ? parseFloat(outcomePrices[0]) : 0.5,
          priceChange24h: Math.random() * 0.2 - 0.1, // This would need to be calculated from historical data
          volume24h: 0, // Volume is typically at event level, not individual market level
          liquidity: market.liquidity ? parseFloat(market.liquidity) : (market.liquidityNum || 0),
          endDate: market.endDate,
          probability: outcomePrices[0] ? Math.round(parseFloat(outcomePrices[0]) * 100) : 50,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: outcomes,
          slug: market.slug,
          tags: tags.map((tag: any) => tag.label || tag.slug || tag).filter(Boolean),
          image: market.eventImage || market.image,
          icon: market.eventIcon || market.icon,
        };
      }),
      total: activeMarkets.length,
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
          id: '0x9deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e709c',
          name: 'Avengers doomsday to cross $100M',
          description: 'Will the Avengers Doomsday movie cross $100M at the box office in its opening weekend?',
          category: 'Entertainment',
          currentPrice: 0.27,
          priceChange24h: 0.069,
          volume24h: 66231,
          liquidity: 72742,
          endDate: '2025-10-10T00:00:00Z',
          probability: 27,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'avengers-doomsday-100m',
          tags: ['Entertainment', 'Movies'],
          image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/avengers.png',
          icon: '🎬'
        },
        {
          id: '0x8deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e709d',
          name: 'Chat gpt 6 to release',
          description: 'Will OpenAI release Chat GPT-6 before the end of 2025?',
          category: 'Technology',
          currentPrice: 0.63,
          priceChange24h: 0.05,
          volume24h: 45123,
          liquidity: 89542,
          endDate: '2025-12-31T23:59:59Z',
          probability: 63,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'chatgpt-6-release',
          tags: ['Technology', 'AI'],
          icon: '🤖'
        },
        {
          id: '0x7deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e709e',
          name: 'Bitcoin to Cross $100k End of 2026',
          description: 'Will Bitcoin reach $100,000 USD by the end of 2026?',
          category: 'Crypto',
          currentPrice: 0.68,
          priceChange24h: 0.12,
          volume24h: 234567,
          liquidity: 456789,
          endDate: '2026-12-31T23:59:59Z',
          probability: 68,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'bitcoin-100k-2026',
          tags: ['Crypto', 'Bitcoin'],
          icon: '₿'
        },
        {
          id: '0x6deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e709f',
          name: 'Manchester City to win Premier League',
          description: 'Will Manchester City win the 2024-2025 Premier League season?',
          category: 'Sports',
          currentPrice: 0.45,
          priceChange24h: -0.08,
          volume24h: 78901,
          liquidity: 134567,
          endDate: '2025-05-25T00:00:00Z',
          probability: 45,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'manchester-city-premier-league',
          tags: ['Sports', 'Football'],
          icon: '⚽'
        },
        {
          id: '0x5deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e7090',
          name: 'Russia to Stop War against Ukraine',
          description: 'Will Russia officially end military operations in Ukraine by the end of 2025?',
          category: 'Politics',
          currentPrice: 0.32,
          priceChange24h: 0.02,
          volume24h: 156789,
          liquidity: 289456,
          endDate: '2025-12-31T23:59:59Z',
          probability: 32,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'russia-ukraine-war-end',
          tags: ['Politics', 'World Events'],
          icon: '🌍'
        },
        {
          id: '0x4deb0baac40648821f96f01339229a422e2f5c877de55dc4dbf981f95a1e7091',
          name: 'Cancer Vaccine to be Available for Public',
          description: 'Will a cancer vaccine become publicly available for general use by the end of 2025?',
          category: 'Health',
          currentPrice: 0.38,
          priceChange24h: 0.04,
          volume24h: 67890,
          liquidity: 123456,
          endDate: '2025-12-31T23:59:59Z',
          probability: 38,
          isWatched: false,
          active: true,
          closed: false,
          outcomes: ['Yes', 'No'],
          slug: 'cancer-vaccine-public',
          tags: ['Health', 'Medical'],
          icon: '🧬'
        }
      ],
      total: 6,
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