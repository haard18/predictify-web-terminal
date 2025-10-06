import { NextRequest, NextResponse } from 'next/server';

const POLYMARKET_API_BASE = 'https://clob.polymarket.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: marketId } = await params;
    console.log('Fetching market details for ID:', marketId);

    // Fetch market details
    const marketResponse = await fetch(`${POLYMARKET_API_BASE}/markets/${marketId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!marketResponse.ok) {
      throw new Error(`Failed to fetch market: ${marketResponse.status}`);
    }

    const market = await marketResponse.json();

    // Fetch orderbook data (if available)
    let orderbook = null;
    try {
      const orderbookResponse = await fetch(`${POLYMARKET_API_BASE}/book?token_id=${market.tokens?.[0]?.token_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (orderbookResponse.ok) {
        orderbook = await orderbookResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch orderbook:', error);
    }

    // Generate mock price history for the chart
    const generatePriceHistory = () => {
      const days = 30;
      const basePrice = market.tokens?.[0]?.price || 0.5;
      const history = [];
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic price movement
        const volatility = 0.1;
        const randomChange = (Math.random() - 0.5) * volatility;
        const price = Math.max(0.01, Math.min(0.99, basePrice + randomChange));
        
        history.push({
          timestamp: date.toISOString(),
          price: price,
          volume: Math.random() * 10000,
        });
      }
      
      return history;
    };

    // Transform the data
    const transformedMarket = {
      id: market.condition_id || marketId,
      name: market.question || 'Unknown Market',
      description: market.description || market.question || 'No description available',
      category: (market.tags && market.tags[0]) || 'Other',
      image: market.image,
      icon: market.icon,
      endDate: market.end_date_iso,
      startDate: market.game_start_time,
      active: market.active !== false,
      closed: market.closed === true,
      tags: market.tags || [],
      resolutionSource: market.resolutionSource,
      minBetAmount: market.minimum_order_size || 10,
      minTickSize: market.minimum_tick_size || 0.01,
      
      // Outcomes and prices
      outcomes: market.tokens?.map((token: any) => ({
        id: token.token_id,
        name: token.outcome,
        price: parseFloat(token.price || '0'),
        winner: token.winner || false,
      })) || [
        { id: '1', name: 'Yes', price: 0.65, winner: false },
        { id: '2', name: 'No', price: 0.35, winner: false }
      ],

      // Market stats
      volume24h: parseFloat(market.volume || '0'),
      liquidity: parseFloat(market.liquidity || '0'),
      
      // Price history for chart
      priceHistory: generatePriceHistory(),
      
      // Orderbook
      orderbook: orderbook || {
        bids: [
          { price: 0.64, size: 1000 },
          { price: 0.63, size: 1500 },
          { price: 0.62, size: 2000 },
          { price: 0.61, size: 2500 },
          { price: 0.60, size: 3000 },
        ],
        asks: [
          { price: 0.66, size: 800 },
          { price: 0.67, size: 1200 },
          { price: 0.68, size: 1800 },
          { price: 0.69, size: 2200 },
          { price: 0.70, size: 2800 },
        ]
      },
      
      // Recent trades (mock data)
      recentTrades: [
        { timestamp: new Date().toISOString(), price: 0.65, size: 500, side: 'buy' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), price: 0.64, size: 300, side: 'sell' },
        { timestamp: new Date(Date.now() - 120000).toISOString(), price: 0.65, size: 750, side: 'buy' },
        { timestamp: new Date(Date.now() - 180000).toISOString(), price: 0.63, size: 200, side: 'sell' },
        { timestamp: new Date(Date.now() - 240000).toISOString(), price: 0.64, size: 1000, side: 'buy' },
      ],
    };

    return NextResponse.json(transformedMarket, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error fetching market details:', error);
    
    // Get the marketId for the fallback response
    const { id: marketId } = await params;
    
    // Return mock data as fallback
    const mockMarket = {
      id: marketId,
      name: 'Sample Prediction Market',
      description: 'This is a sample market for demonstration purposes.',
      category: 'Demo',
      image: null,
      icon: null,
      endDate: '2025-12-31T23:59:59Z',
      active: true,
      closed: false,
      tags: ['demo', 'sample'],
      
      outcomes: [
        { id: '1', name: 'Yes', price: 0.65, winner: false },
        { id: '2', name: 'No', price: 0.35, winner: false }
      ],
      
      volume24h: 50000,
      liquidity: 250000,
      
      priceHistory: [],
      
      orderbook: {
        bids: [
          { price: 0.64, size: 1000 },
          { price: 0.63, size: 1500 },
          { price: 0.62, size: 2000 },
        ],
        asks: [
          { price: 0.66, size: 800 },
          { price: 0.67, size: 1200 },
          { price: 0.68, size: 1800 },
        ]
      },
      
      recentTrades: [
        { timestamp: new Date().toISOString(), price: 0.65, size: 500, side: 'buy' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), price: 0.64, size: 300, side: 'sell' },
      ],
    };

    return NextResponse.json(mockMarket, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}