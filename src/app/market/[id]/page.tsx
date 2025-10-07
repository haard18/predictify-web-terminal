'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Clock, ExternalLink, Star } from 'lucide-react';
import { polymarketAPI } from '@/lib/polymarket-api';

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
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
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWatchlist}
                className={`p-2 rounded-lg transition-colors ${
                  isWatchlisted ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Star className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>
              
              <div className="flex items-center gap-2">
                {market.closed ? (
                  <span className="px-3 py-1 bg-red-600 text-sm rounded-full">Closed</span>
                ) : market.active ? (
                  <span className="px-3 py-1 bg-green-600 text-sm rounded-full">Active</span>
                ) : (
                  <span className="px-3 py-1 bg-gray-600 text-sm rounded-full">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Row: Order Book | Graph | Trading Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Order Book */}
          <div className="bg-gray-800 rounded-xl p-6 h-[520px] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Order Book</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2">Asks (Sell)</h4>
                <div className="space-y-1">
                  {market.orderbook.asks.slice(0, 10).map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{(ask.price * 100).toFixed(1)}¢</span>
                      <span className="text-gray-400">${ask.size}</span>
                    </div>
                  ))}
                  {market.orderbook.asks.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-2">No asks available</div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-green-400 mb-2">Bids (Buy)</h4>
                <div className="space-y-1">
                  {market.orderbook.bids.slice(0, 10).map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{(bid.price * 100).toFixed(1)}¢</span>
                      <span className="text-gray-400">${bid.size}</span>
                    </div>
                  ))}
                  {market.orderbook.bids.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-2">No bids available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Graph */}
          <div className="bg-gray-800 rounded-xl p-6 h-[520px]">
            <h3 className="text-lg font-semibold mb-4">Price History</h3>
            <div className="h-[420px] relative">
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
          <div className="bg-gray-800 rounded-xl p-6 h-[520px] overflow-auto">
            {/* User Profile Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
              <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              <span className="text-white font-medium">Zohran Mamdani</span>
            </div>

            {/* Buy/Sell Tabs */}
            <div className="flex mb-6">
              <button className="flex-1 py-2 px-4 text-blue-400 border-b-2 border-blue-400 font-medium">
                Buy
              </button>
              <button className="flex-1 py-2 px-4 text-gray-400 hover:text-white transition-colors">
                Sell
              </button>
              <div className="flex items-center ml-4">
                <span className="text-gray-400 text-sm">Market</span>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Yes/No Outcome Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => setSelectedOutcome('yes')}
                className={`p-3 rounded-lg text-white font-semibold transition-colors ${
                  selectedOutcome === 'yes' 
                    ? 'bg-green-600' 
                    : 'bg-green-600/80 hover:bg-green-600'
                }`}
              >
                <div>Yes</div>
                <div className="text-lg font-bold">
                  {formatPrice(market.currentPrice || 0.5)}
                </div>
              </button>
              
              <button 
                onClick={() => setSelectedOutcome('no')}
                className={`p-3 rounded-lg text-white font-semibold transition-colors ${
                  selectedOutcome === 'no' 
                    ? 'bg-red-600' 
                    : 'bg-red-600/80 hover:bg-red-600'
                }`}
              >
                <div>No</div>
                <div className="text-lg font-bold">
                  {formatPrice(1 - (market.currentPrice || 0.5))}
                </div>
              </button>
            </div>

            {/* Half/Max Buttons */}
            <div className="flex gap-2 mb-4">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                Half
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                Max
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Enter Amount</label>
              <div className="flex items-center gap-2 mb-3">
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                  +$10
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                  +$25
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                  +$50
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={market.minBetAmount}
                step="1"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="0.00"
              />
            </div>

            {/* Cash and Minimum Info */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
              <span>Cash: $0.00</span>
              <span>Minimum: $1.00</span>
            </div>

            {/* Take Profit / Stop Loss */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm">Take Profit / Stop Loss</span>
              <div className="w-5 h-5 border border-gray-600 rounded bg-gray-700"></div>
            </div>

            {/* Connect Wallet Button */}
            <button
              disabled={market.closed}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
            >
              {market.closed ? 'Market Closed' : 'Connect Wallet to Trade'}
            </button>
          </div>
        </div>

        {/* Below: Everything Else */}
        <div className="space-y-6">
          {/* Price Overview */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-600 hover:bg-green-700 rounded-lg p-4 text-center cursor-pointer transition-colors">
                <div className="text-white font-semibold text-lg mb-1">Yes</div>
                <div className="text-white text-2xl font-bold">
                  {formatPrice(market.currentPrice || 0.5)}
                </div>
              </div>
              
              <div className="bg-red-600 hover:bg-red-700 rounded-lg p-4 text-center cursor-pointer transition-colors">
                <div className="text-white font-semibold text-lg mb-1">No</div>
                <div className="text-white text-2xl font-bold">
                  {formatPrice(1 - (market.currentPrice || 0.5))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-4">
              <div className={`flex items-center gap-1 text-sm ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(priceChange).toFixed(2)}% 24h
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">24h Volume</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(market.volume24h)}</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Liquidity</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(market.liquidity)}</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Ends</span>
              </div>
              <div className="text-sm font-medium">
                {new Date(market.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

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
  );
}