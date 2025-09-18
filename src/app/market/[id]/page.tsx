'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Clock, ExternalLink, Star } from 'lucide-react';

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

  useEffect(() => {
    const fetchMarketDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/markets/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market details');
        }
        
        const data = await response.json();
        setMarket(data);
        setSelectedOutcome(data.outcomes[0]?.id || '');
        
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

  if (error || !market) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-900 text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Overview */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6">
                {market.outcomes.map((outcome) => (
                  <div key={outcome.id} className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{outcome.name}</h3>
                    <div className="text-3xl font-bold mb-2">
                      {(outcome.price * 100).toFixed(1)}¢
                    </div>
                    <div className={`flex items-center justify-center gap-1 text-sm ${
                      priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(priceChange).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-3 gap-4">
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

            {/* Simple Price Chart */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Price History</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {market.priceHistory.slice(-20).map((point, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t opacity-75 hover:opacity-100 transition-opacity"
                    style={{
                      height: `${point.price * 100}%`,
                      width: `${100 / 20}%`,
                    }}
                    title={`${(point.price * 100).toFixed(1)}¢ at ${new Date(point.timestamp).toLocaleDateString()}`}
                  />
                ))}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trading Panel */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Place Trade</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Outcome</label>
                  <select
                    value={selectedOutcome}
                    onChange={(e) => setSelectedOutcome(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {market.outcomes.map((outcome) => (
                      <option key={outcome.id} value={outcome.id}>
                        {outcome.name} - {(outcome.price * 100).toFixed(1)}¢
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min={market.minBetAmount}
                    step="1"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Max payout: ${(parseInt(betAmount) / (market.outcomes.find(o => o.id === selectedOutcome)?.price || 1)).toFixed(2)}</div>
                  <div>Min bet: ${market.minBetAmount}</div>
                </div>
                
                <button
                  disabled={market.closed}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {market.closed ? 'Market Closed' : 'Place Trade'}
                </button>
              </div>
            </div>

            {/* Orderbook */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Order Book</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Asks (Sell)</h4>
                  <div className="space-y-1">
                    {market.orderbook.asks.slice(0, 5).map((ask, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{(ask.price * 100).toFixed(1)}¢</span>
                        <span className="text-gray-400">${ask.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-green-400 mb-2">Bids (Buy)</h4>
                  <div className="space-y-1">
                    {market.orderbook.bids.slice(0, 5).map((bid, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{(bid.price * 100).toFixed(1)}¢</span>
                        <span className="text-gray-400">${bid.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}