import { NextRequest, NextResponse } from 'next/server';

const POLY_CLOB = 'https://clob.polymarket.com';
const POLY_GAMMA = 'https://gamma-api.polymarket.com';

async function fetchJson(url: string, opts: any = {}) {
  const res = await fetch(url, { method: 'GET', cache: 'no-store', ...opts });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} - ${url}`);
  return res.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: marketId } = await params;

  try {
    console.log('Fetching market details for ID:', marketId);

    // First, try to get market data from our main markets API (which has working mock data)
    let market: any = null;
    try {
      const marketsUrl = new URL('/api/markets', request.url);
      const marketsResponse = await fetch(marketsUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
      
      if (marketsResponse.ok) {
        const marketsData = await marketsResponse.json();
        const foundMarket = marketsData.markets?.find((m: any) => m.id === marketId);
        
        if (foundMarket) {
          console.log('Found market in main markets API:', foundMarket.name);
          // Transform the market data to match the individual market API format
          const transformedMarket = {
            id: foundMarket.id,
            name: foundMarket.name,
            description: foundMarket.description,
            category: foundMarket.category,
            image: foundMarket.image,
            icon: foundMarket.icon,
            endDate: foundMarket.endDate,
            active: foundMarket.active,
            closed: foundMarket.closed,
            tags: foundMarket.tags || [],
            outcomes: [
              { id: '1', label: 'Yes', price: foundMarket.currentPrice, orderbook: null },
              { id: '2', label: 'No', price: 1 - foundMarket.currentPrice, orderbook: null },
            ],
            currentPrice: foundMarket.currentPrice,
            volume24h: foundMarket.volume24h,
            liquidity: foundMarket.liquidity,
            priceHistory: [] as any[], // Generate below
            recentTrades: [] as any[], // Generate below
            orderbook: { bids: [], asks: [] },
            fetchedAt: new Date().toISOString(),
          };
          
          // Generate price history based on current price
          const generatePriceHistory = (base: number, days = 30) => {
            const arr: any[] = [];
            for (let i = days; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const vol = Math.max(0.01, Math.min(0.99, base + (Math.random() - 0.5) * 0.12));
              arr.push({ timestamp: d.toISOString(), price: parseFloat(vol.toFixed(4)), volume: Math.floor(Math.random() * 1000) });
            }
            return arr;
          };
          
          transformedMarket.priceHistory = generatePriceHistory(foundMarket.currentPrice);
          transformedMarket.recentTrades = [
            { timestamp: new Date().toISOString(), price: foundMarket.currentPrice, size: 500, side: 'buy' },
            { timestamp: new Date(Date.now() - 60000).toISOString(), price: foundMarket.currentPrice * 0.98, size: 300, side: 'sell' },
          ];
          
          return NextResponse.json(transformedMarket, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from main markets API, falling back to external APIs');
    }

    // Fallback to external APIs if market not found in main API
    // Prefer Gamma for market metadata (question, description, outcomes)
    try {
      const gammaUrl = `${POLY_GAMMA}/markets/${encodeURIComponent(marketId)}`;
      market = await fetchJson(gammaUrl, { headers: { Accept: 'application/json' } });
    } catch (e) {
      // Gamma may not have the market; fallback to CLOB for market metadata
      console.warn('Gamma market fetch failed, falling back to CLOB for market metadata');
      const marketUrl = `${POLY_CLOB}/markets/${encodeURIComponent(marketId)}`;
      market = await fetchJson(marketUrl, { headers: { Accept: 'application/json' } });
    }

    // Determine tokens (outcomes) for the market. Prefer CLOB tokens when available for orderbook linkage.
    let tokens: any[] = [];
    // Gamma sometimes provides clobTokenIds or clob_token_ids; try to extract
    if (market.clobTokenIds && typeof market.clobTokenIds === 'string') {
      tokens = market.clobTokenIds.split(',').map((t: string) => ({ token_id: t.trim() }));
    }
    if (tokens.length === 0 && market.clob_token_ids && typeof market.clob_token_ids === 'string') {
      tokens = market.clob_token_ids.split(',').map((t: string) => ({ token_id: t.trim() }));
    }
    // If still missing, try CLOB market tokens
    if (tokens.length === 0) {
      try {
        const clobMarket = await fetchJson(`${POLY_CLOB}/markets/${encodeURIComponent(marketId)}`, { headers: { Accept: 'application/json' } });
        tokens = clobMarket.tokens || [];
      } catch (e) {
        // leave tokens empty and let downstream fallback handle it
        tokens = market.tokens || [];
      }
    }

    // Fetch orderbook for each token in parallel (if tokens exist)
    const orderbookByToken: Record<string, any> = {};
    if (tokens.length > 0) {
      await Promise.all(tokens.map(async (token: any) => {
        try {
          const bookUrl = `${POLY_CLOB}/book?token_id=${encodeURIComponent(token.token_id)}`;
          const book = await fetchJson(bookUrl, { headers: { Accept: 'application/json' } });
          orderbookByToken[token.token_id] = book;
        } catch (err) {
            const e: any = err;
            console.warn('Orderbook fetch failed for token', token.token_id, e?.message || e);
            orderbookByToken[token.token_id] = null;
          }
      }));
    }

    // Try to enrich market data from Gamma API (if available)
    let gammaData: any = null;
    try {
      // Gamma may expose events or markets endpoint - try both safely
      const gammaMarketUrl = `${POLY_GAMMA}/events/${marketId}`;
      gammaData = await fetchJson(gammaMarketUrl, { headers: { Accept: 'application/json' } });
    } catch (e) {
      // ignore gamma enrichment failure
      gammaData = null;
    }

    // Build outcomes array with prices and attached orderbooks
    const outcomes = (tokens.length > 0 ? tokens : [
      { token_id: '1', outcome: 'Yes', price: '0.5' },
      { token_id: '2', outcome: 'No', price: '0.5' }
    ]).map((t: any) => ({
      id: t.token_id || t.id,
      label: t.outcome || t.name || t.symbol || `Outcome ${t.token_id || '1'}`,
      price: typeof t.price === 'string' ? parseFloat(t.price) : (t.price ?? 0),
      isWinner: !!t.winner,
      orderbook: orderbookByToken[t.token_id] || null,
    }));

    // Simple price history generator as fallback (30 days) using token[0] as base
    const generatePriceHistory = (base = 0.5, days = 30) => {
      const arr: any[] = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const vol = Math.max(0.01, Math.min(0.99, base + (Math.random() - 0.5) * 0.12));
        arr.push({ timestamp: d.toISOString(), price: parseFloat(vol.toFixed(4)) });
      }
      return arr;
    };

    const basePrice = outcomes[0]?.price ?? 0.5;

    // Recent trades endpoint could be different; construct a mock if missing
    let recentTrades: any[] = [];
    try {
      // CLOB may expose trades; try a reasonable endpoint
      const tradesUrl = `${POLY_CLOB}/trades?market_id=${encodeURIComponent(marketId)}&limit=20`;
      recentTrades = await fetchJson(tradesUrl, { headers: { Accept: 'application/json' } });
    } catch (e) {
      // fallback mock trades
      recentTrades = [
        { timestamp: new Date().toISOString(), price: outcomes[0]?.price ?? basePrice, size: 500, side: 'buy' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), price: outcomes[0]?.price ?? basePrice, size: 300, side: 'sell' },
      ];
    }

    const transformed = {
      id: market.condition_id || marketId,
      name: market.question || market.title || market.name || gammaData?.title || 'Unknown Market',
      description: market.description || gammaData?.description || market.question || '',
      category: (market.tags && market.tags[0]) || gammaData?.tags || 'Other',
      image: market.image || gammaData?.image || null,
      icon: market.icon || gammaData?.icon || null,
      endDate: market.end_date_iso || market.endDate || market.end_date || gammaData?.endDate || null,
      startDate: market.start_date_iso || market.startDate || market.game_start_time || null,
      active: market.active !== false,
      closed: market.closed === true,
      tags: market.tags || gammaData?.tags || [],
      resolutionSource: market.resolutionSource || null,
      minBetAmount: market.minimum_order_size || market.min_order_size || null,
      minTickSize: market.minimum_tick_size || market.min_tick_size || null,
      outcomes,
      // Add currentPrice for consistency with DiscoverPage
      currentPrice: outcomes[0]?.price ?? basePrice,
      volume24h: parseFloat(market.volume || market.volume24h || '0') || 0,
      liquidity: parseFloat(market.liquidity || market.liquidityNum || '0') || 0,
      priceHistory: market.price_history || generatePriceHistory(basePrice, 30),
      recentTrades,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(transformed, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err: any) {
    console.error('Error in market detail API:', err?.message || err);

    // Fallback response with minimal mock data
    const mock = {
      id: marketId,
      name: 'Sample Market (fallback)',
      description: 'Fallback data: failed to fetch live market details',
      outcomes: [
        { id: '1', label: 'Yes', price: 0.65, orderbook: null },
        { id: '2', label: 'No', price: 0.35, orderbook: null },
      ],
      // Add currentPrice for consistency with DiscoverPage
      currentPrice: 0.65,
      volume24h: 0,
      liquidity: 0,
      priceHistory: [],
      recentTrades: [],
      fetchedAt: new Date().toISOString(),
      error: err?.message || String(err),
    };

    return NextResponse.json(mock, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }
}