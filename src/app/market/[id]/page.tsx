'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Clock, ExternalLink, Star } from 'lucide-react';
import { polymarketAPI } from '@/lib/polymarket-api';
import TopNav from '@/components/TopNav';

interface Market {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  icon?: string;
  endDate: string;
  startDate?: string;
  active: boolean;
  closed: boolean;
  tags: string[];
  resolutionSource?: string;
  minBetAmount: number;
  minTickSize: number;
  currentPrice: number; // Add currentPrice field for consistency with DiscoverPage
  outcomes: Array<{
    id: string;
    name: string;
    price: number;
    winner: boolean;
  }>;
  volume24h: number;
  liquidity: number;
  priceHistory: Array<{
    timestamp: string;
    price: number;
    volume: number;
  }>;
  orderbook: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
  recentTrades: Array<{
    timestamp: string;
    price: number;
    size: number;
    side: 'buy' | 'sell';
  }>;
}

// Market icon mapping based on category/tags (same as DiscoverPage)
const getMarketIcon = (market: Market) => {
  const tags = market.tags?.map(tag => tag.toLowerCase()) || [];
  const category = market.category?.toLowerCase() || '';
  
  // Use the market's actual image/icon if available
  if (market.image) return market.image;
  if (market.icon) return market.icon;
  
  // Sports icons
  if (tags.includes('sports') || tags.includes('nfl') || tags.includes('football') || 
      category.includes('sport') || market.name.toLowerCase().includes('nfl')) {
    return '🏈';
  }
  if (tags.includes('soccer') || tags.includes('football') || market.name.toLowerCase().includes('premier league')) {
    return '⚽';
  }
  if (tags.includes('basketball') || tags.includes('nba')) {
    return '🏀';
  }
  
  // Crypto icons
  if (tags.includes('crypto') || tags.includes('bitcoin') || tags.includes('btc') || 
      category.includes('crypto') || market.name.toLowerCase().includes('bitcoin')) {
    return '₿';
  }
  if (tags.includes('ethereum') || tags.includes('eth')) {
    return 'Ξ';
  }
  
  // Tech icons
  if (tags.includes('tech') || tags.includes('ai') || tags.includes('technology') || 
      category.includes('tech') || market.name.toLowerCase().includes('gpt')) {
    return '🤖';
  }
  
  // Politics icons
  if (tags.includes('politics') || tags.includes('election') || category.includes('politic')) {
    return '🗳️';
  }
  
  // Entertainment/Movies
  if (tags.includes('entertainment') || tags.includes('movie') || tags.includes('avengers') ||
      market.name.toLowerCase().includes('avengers') || market.name.toLowerCase().includes('movie')) {
    return '🎬';
  }
  
  // Default
  return '📊';
};

export default function MarketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Mock order book data
  const mockAsks = [
    { price: 0.58, shares: 1250, total: 725 },
    { price: 0.59, shares: 2100, total: 1239 },
    { price: 0.60, shares: 3500, total: 2100 },
    { price: 0.61, shares: 1800, total: 1098 },
    { price: 0.62, shares: 2400, total: 1488 },
    { price: 0.63, shares: 1600, total: 1008 },
    { price: 0.64, shares: 2800, total: 1792 },
    { price: 0.65, shares: 3200, total: 2080 },
  ];

  const mockBids = [
    { price: 0.57, shares: 2200, total: 1254 },
    { price: 0.56, shares: 3100, total: 1736 },
    { price: 0.55, shares: 2800, total: 1540 },
    { price: 0.54, shares: 1900, total: 1026 },
    { price: 0.53, shares: 2500, total: 1325 },
    { price: 0.52, shares: 3300, total: 1716 },
    { price: 0.51, shares: 2100, total: 1071 },
    { price: 0.50, shares: 4000, total: 2000 },
  ];

  // Fetch chart data from API
  const fetchChartData = async (marketId: string) => {
    setLoadingChart(true);
    try {
      const priceHistory = await polymarketAPI.getPriceHistory(marketId, '1h', 40);
      const chartDataPoints: number[] = priceHistory.map(point => point.price);
      setChartData(chartDataPoints);
    } catch (error) {
      console.error(`Error fetching chart data for ${marketId}:`, error);
      // Fallback to generated data if API fails
      const seed = marketId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const fallbackData: number[] = Array.from({ length: 40 }, (_, i) => {
        const random = (Math.sin(seed * (i + 1)) + 1) / 2;
        return 0.3 + (random * 0.4);
      });
      setChartData(fallbackData);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/markets/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market details');
        }
        
        const data = await response.json();

        // Normalize API response (new endpoint returns outcomes with { id, label, price, orderbook })
        const normalizedMarket: any = {
          // keep existing keys if present
          id: data.id,
          name: data.name || data.title || data.question || 'Unknown Market',
          description: data.description || '',
          category: data.category || 'Other',
          image: data.image || null,
          icon: data.icon || null,
          endDate: data.endDate || data.end_date || data.end_date_iso || null,
          startDate: data.startDate || data.start_date || data.start_date_iso || null,
          active: data.active ?? true,
          closed: data.closed ?? false,
          tags: data.tags || [],
          resolutionSource: data.resolutionSource || data.resolution_source || null,
          minBetAmount: data.minBetAmount ?? data.minimum_order_size ?? 1,
          minTickSize: data.minTickSize ?? data.minimum_tick_size ?? 0.01,

          // Add currentPrice field for consistency with DiscoverPage
          currentPrice: data.currentPrice ?? (data.outcomes?.[0]?.price ?? 0.5),

          // Map outcomes to the shape the UI expects
          outcomes: (data.outcomes || []).map((o: any) => ({
            id: o.id,
            name: o.label || o.name || o.outcome || `Outcome ${o.id}`,
            price: typeof o.price === 'string' ? parseFloat(o.price) : (o.price ?? 0),
            winner: o.isWinner ?? o.winner ?? false,
            orderbook: o.orderbook || null,
          })),

          // Volume / liquidity
          volume24h: data.volume24h ?? data.volume ?? 0,
          liquidity: data.liquidity ?? 0,

          // Price history and trades
          priceHistory: data.priceHistory || data.price_history || [],
          recentTrades: data.recentTrades || data.recent_trades || [],
        };

        // Provide a top-level orderbook (UI expects market.orderbook)
        if (data.orderbook) {
          normalizedMarket.orderbook = data.orderbook;
        } else if (normalizedMarket.outcomes.length > 0 && normalizedMarket.outcomes[0].orderbook) {
          normalizedMarket.orderbook = normalizedMarket.outcomes[0].orderbook;
        } else {
          normalizedMarket.orderbook = { bids: [], asks: [] };
        }

        console.log('Raw API data:', data);
        console.log('Normalized market data:', normalizedMarket);
        console.log('Current price:', normalizedMarket.currentPrice);
        
        setMarket(normalizedMarket);
        setSelectedOutcome('yes');
        
        // Fetch real-time chart data
        fetchChartData(data.id);
        
        // Check if market is in watchlist
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setIsWatchlisted(watchlist.includes(data.id));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMarketDetails();
    }
  }, [params.id]);

  const toggleWatchlist = () => {
    if (!market) return;
    
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const newWatchlist = isWatchlisted
      ? watchlist.filter((id: string) => id !== market.id)
      : [...watchlist, market.id];
    
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    setIsWatchlisted(!isWatchlisted);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    // Handle invalid values
    if (price === null || price === undefined || isNaN(Number(price))) {
      return '50¢'; // Default fallback
    }
    // Match DiscoverPage formatting exactly
    return `${Math.round(price * 100)}¢`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mini Chart Component (matches DiscoverPage)
  const MiniChart = ({ data, isPositive, isLoading }: { data: number[], isPositive: boolean, isLoading?: boolean }) => {
    if (isLoading || data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 0.1;
    
    // Calculate Y-axis labels (5 evenly spaced values)
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
      const value = maxValue - (i * range / 4);
      return { value, label: formatPrice(value) };
    });

    // Calculate X-axis labels (show every 8th point for ~5 labels)
    const xAxisLabels = Array.from({ length: 5 }, (_, i) => {
      const index = Math.floor((i * (data.length - 1)) / 4);
      return { index, label: `${data.length - index}h ago` };
    });
    
    // Create SVG path
    const pathData = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100; // Percentage width
      const y = 100 - ((value - minValue) / range) * 100; // Percentage height, inverted
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="relative w-full h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
          {yAxisLabels.map((label, i) => (
            <div key={i} className="text-right pr-2">
              {label.label}
            </div>
          ))}
        </div>

        {/* Chart SVG */}
        <div className="absolute left-12 right-0 top-0 bottom-8">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
            {/* Background grid */}
            <defs>
              <pattern id="grid-detail" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id={`gradient-detail-${isPositive ? 'green' : 'red'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid-detail)" />
            
            {/* Gradient fill under line */}
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill={`url(#gradient-detail-${isPositive ? 'green' : 'red'})`}
            />
            
            {/* Chart line */}
            <path
              d={pathData}
              fill="none"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Data points */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill={isPositive ? '#22c55e' : '#ef4444'}
                  className="opacity-60"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-400">
          {xAxisLabels.map((label, i) => (
            <div key={i} className="text-center">
              {label.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error || !market) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Market Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The requested market could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const primaryOutcome = market.outcomes[0];
  const priceChange = market.priceHistory.length > 1 
    ? ((market.priceHistory[market.priceHistory.length - 1].price - market.priceHistory[0].price) / market.priceHistory[0].price) * 100
    : 0;

  return (
    <>
      <TopNav 
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Header */}
        <div className="border-b border-gray-800 bg-black relative z-10">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Market Icon/Photo */}
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl rounded-lg bg-gray-800">
                {typeof getMarketIcon(market) === 'string' && getMarketIcon(market).startsWith('http') ? (
                  <img 
                    src={getMarketIcon(market)} 
                    alt={market.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>{getMarketIcon(market)}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{market.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400">{market.category}</span>
                    {market.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-800 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Bookmark Icon */}
                <button
                  onClick={toggleWatchlist}
                  className="mt-[-5%] hover:bg-gray-800 rounded-lg transition-colors"
                  title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <svg 
                    className={`w-6 h-6 transition-colors ${
                      isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-gray-300'
                    }`}
                    fill={isWatchlisted ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Options filling the space - 3 columns */}
            <div className="flex-1 grid grid-cols-3 gap-2 ml-8">
              {/* Option 1 */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-gray-700 hover:bg-black/60 transition-colors cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-200 font-medium">Option 1</span>
              </div>

              {/* Option 2 */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-gray-700 hover:bg-black/60 transition-colors cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-200 font-medium">Option 2</span>
              </div>

              {/* Option 3 */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-gray-700 hover:bg-black/60 transition-colors cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-200 font-medium">Option 3</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Top Row: Order Book | Graph | Trading Panel - Full viewport height */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr] gap-4 mb-4" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Left: Order Book */}
          <div className="bg-black/80 border border-gray-800 rounded-xl p-5 h-full overflow-auto backdrop-blur-sm">
            <h3 className="text-base font-semibold mb-4 text-gray-200">Order Book</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">Asks (Sell)</h4>
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-2 px-2">
                  <span>Price</span>
                  <span>Shares</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1">
                  {mockAsks.map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm bg-red-500/5 hover:bg-red-500/10 px-2 py-1.5 rounded transition-colors">
                      <span className="text-red-400 font-semibold">{(ask.price * 100).toFixed(1)}¢</span>
                      <span className="text-gray-400 text-xs">{ask.shares.toLocaleString()}</span>
                      <span className="text-gray-300 text-xs">${ask.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <h4 className="text-xs font-semibold text-green-400 mb-3 uppercase tracking-wider">Bids (Buy)</h4>
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-2 px-2">
                  <span>Price</span>
                  <span>Shares</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1">
                  {mockBids.map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm bg-green-500/5 hover:bg-green-500/10 px-2 py-1.5 rounded transition-colors">
                      <span className="text-green-400 font-semibold">{(bid.price * 100).toFixed(1)}¢</span>
                      <span className="text-gray-400 text-xs">{bid.shares.toLocaleString()}</span>
                      <span className="text-gray-300 text-xs">${bid.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Graph */}
          <div className="bg-black/80 border border-gray-800 rounded-xl p-5 h-full backdrop-blur-sm flex flex-col">
            <h3 className="text-base font-semibold mb-4 text-gray-200">Price History</h3>
            <div className="flex-1 relative">
              {loadingChart ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : chartData.length > 0 ? (
                <MiniChart 
                  data={chartData} 
                  isPositive={priceChange >= 0} 
                  isLoading={loadingChart}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  No price history available
                </div>
              )}
            </div>
          </div>

          {/* Right: Trading Panel */}
          <div className="bg-black/80 border border-gray-800 rounded-xl p-4 h-full overflow-hidden backdrop-blur-sm flex flex-col">
            {/* Buy/Sell Tabs - No user profile header */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div className="flex gap-2">
                <button className="py-1.5 px-4 text-white font-medium text-sm bg-transparent border border-green-500/30">
                  Buy
                </button>
                <button className="py-1.5 px-4 text-gray-400 hover:text-white transition-colors text-sm font-normal bg-transparent border border-gray-700/30">
                  Sell
                </button>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-gray-800">
                <span className="text-gray-300 text-sm">Market</span>
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Yes/No Outcome Buttons - Transparent with hover effect */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => setSelectedOutcome('yes')}
                className={`group relative p-2.5 font-semibold transition-all overflow-hidden ${
                  selectedOutcome === 'yes' 
                    ? 'bg-green-600/20 ring-1 ring-green-500 text-green-400' 
                    : 'bg-transparent border border-green-600/30 text-green-400 hover:bg-green-600/10'
                }`}
              >
                <div className="text-xs opacity-90">Yes</div>
                <div className="text-base font-bold opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-green-600/20 transition-opacity duration-200">
                  {formatPrice(market.currentPrice || 0.5)}
                </div>
              </button>
              
              <button 
                onClick={() => setSelectedOutcome('no')}
                className={`group relative p-2.5 font-semibold transition-all overflow-hidden ${
                  selectedOutcome === 'no' 
                    ? 'bg-red-600/20 ring-1 ring-red-500 text-red-400' 
                    : 'bg-transparent border border-red-600/30 text-red-400 hover:bg-red-600/10'
                }`}
              >
                <div className="text-sm opacity-90">No</div>
                <div className="text-lg font-bold opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-red-600/20 transition-opacity duration-200">
                  {formatPrice(1 - (market.currentPrice || 0.5))}
                </div>
              </button>
            </div>



            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">No. of Shares</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={market.minBetAmount}
                step="1"
                className="w-full p-3 bg-transparent border border-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-white text-base placeholder:text-gray-600"
                placeholder="$800"
              />
              <div className="flex items-center gap-2 mt-2">
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 text-sm transition-colors border border-gray-800">
                  +$10
                </button>
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 text-sm transition-colors border border-gray-800">
                  +$25
                </button>
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 text-sm transition-colors border border-gray-800">
                  +$50
                </button>
              </div>
            </div>

            {/* Expiration Options */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">Expiration</label>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-300 text-sm transition-colors border border-gray-800">
                  None
                </button>
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 border border-gray-800 text-sm transition-colors">
                  EOD
                </button>
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 border border-gray-800 text-sm transition-colors">
                  EOM
                </button>
                <button className="px-3 py-1.5 bg-transparent hover:bg-gray-700/40 text-gray-400 border border-gray-800 text-sm transition-colors">
                  Custom
                </button>
              </div>
            </div>

            {/* Price and Total Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Price</span>
                <span className="text-white font-semibold">$34</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total</span>
                <span className="text-white font-semibold">$0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Potential return</span>
                <span className="text-green-400 font-semibold">$0.00(0%)</span>
              </div>
            </div>

            {/* Trade Button */}
            <button
              disabled={market.closed}
              className="w-full py-3 bg-transparent hover:bg-gray-700/40 disabled:bg-gray-900 disabled:cursor-not-allowed font-semibold text-white text-base transition-colors border border-gray-700 mt-auto"
            >
              {market.closed ? 'Market Closed' : 'Trade'}
            </button>
          </div>
        </div>

        {/* Below: Everything Else */}
        <div className="space-y-4">
          {/* Price Overview */}
         

          {/* Market Stats */}
          
          {/* Description */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">About This Market</h3>
            <p className="text-gray-300 leading-relaxed">{market.description}</p>
            {market.resolutionSource && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <ExternalLink className="w-4 h-4" />
                <span>Resolution Source: {market.resolutionSource}</span>
              </div>
            )}
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
            <div className="space-y-2">
              {market.recentTrades.slice(0, 10).map((trade, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {(trade.price * 100).toFixed(1)}¢
                    </span>
                    <span className="text-gray-400">${trade.size}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {formatTimeAgo(trade.timestamp)}
                  </span>
                </div>
              ))}
              {market.recentTrades.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">No recent trades</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}