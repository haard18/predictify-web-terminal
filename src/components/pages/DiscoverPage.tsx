'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { polymarketAPI, PolymarketMarket } from '@/lib/polymarket-api';

interface PricePoint {
  timestamp: number;
  price: number;
}

// Add custom styles for scrollbar hiding and essential animations
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  .animate-scroll:hover {
    animation-play-state: paused;
  }
`;

// Market icon mapping based on category/tags
const getMarketIcon = (market: PolymarketMarket) => {
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
  
  // Health/Medical
  if (tags.includes('health') || tags.includes('medical') || tags.includes('vaccine') ||
      market.name.toLowerCase().includes('vaccine') || market.name.toLowerCase().includes('cancer')) {
    return '🧬';
  }
  
  // World events
  if (tags.includes('world') || tags.includes('war') || tags.includes('ukraine') || tags.includes('russia') ||
      market.name.toLowerCase().includes('war') || market.name.toLowerCase().includes('ukraine')) {
    return '🌍';
  }
  
  // Default
  return '📊';
};

// Trading categories for the carousel
const tradingCategories = [
  { id: 'all', name: 'ALL MARKETS', color: '#3B82F6' },
  { id: 'sports', name: 'SPORTS', color: '#10B981' },
  { id: 'politics', name: 'POLITICS', color: '#8B5CF6' },
  { id: 'crypto', name: 'CRYPTO', color: '#F97316' },
  { id: 'technology', name: 'TECHNOLOGY', color: '#06B6D4' },
  { id: 'entertainment', name: 'ENTERTAINMENT', color: '#EC4899' },
  { id: 'health', name: 'HEALTH', color: '#059669' },
  { id: 'world', name: 'WORLD EVENTS', color: '#6366F1' },
  { id: 'economics', name: 'ECONOMICS', color: '#EAB308' },
  { id: 'climate', name: 'CLIMATE', color: '#14B8A6' },
];

export default function DiscoverPage() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartDataCache, setChartDataCache] = useState<Record<string, number[]>>({});
  const [loadingCharts, setLoadingCharts] = useState<Record<string, boolean>>({});

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await polymarketAPI.getMarkets({ 
        active: true, 
        limit: 50,
        order: 'volume24hr'
      });
      setMarkets(response.markets);
    } catch (err) {
      setError('Failed to load markets');
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${Math.round(value / 1000000)}M`;
    }
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`;
    }
    return `$${Math.round(value)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return `${Math.round(price * 100)}¢`;
  };

  // Fetch chart data from API
  const fetchChartData = async (marketId: string) => {
    if (chartDataCache[marketId] || loadingCharts[marketId]) {
      return chartDataCache[marketId] || [];
    }

    setLoadingCharts(prev => ({ ...prev, [marketId]: true }));

    try {
      const priceHistory = await polymarketAPI.getPriceHistory(marketId, '1h', 12);
      const chartData: number[] = priceHistory.map(point => point.price);
      
      setChartDataCache(prev => ({ ...prev, [marketId]: chartData }));
      setLoadingCharts(prev => ({ ...prev, [marketId]: false }));
      
      return chartData;
    } catch (error) {
      console.error(`Error fetching chart data for ${marketId}:`, error);
      setLoadingCharts(prev => ({ ...prev, [marketId]: false }));
      
      // Fallback to generated data if API fails
      const seed = marketId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const fallbackData: number[] = Array.from({ length: 12 }, (_, i) => {
        const random = (Math.sin(seed * (i + 1)) + 1) / 2;
        return 0.3 + (random * 0.4);
      });
      
      setChartDataCache(prev => ({ ...prev, [marketId]: fallbackData }));
      return fallbackData;
    }
  };

  // Mini Chart Component
  const MiniChart = ({ data, isPositive, isLoading }: { data: number[], isPositive: boolean, isLoading?: boolean }) => {
    if (isLoading || data.length === 0) {
      return (
        <div className="w-20 h-8 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 0.1;
    
    // Create SVG path
    const pathData = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 80; // 80px width
      const y = 24 - ((value - minValue) / range) * 24; // 24px height, inverted
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <div className="w-20 h-8 flex items-center justify-center">
        <svg width="80" height="24" className="overflow-visible">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="12" height="6" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 6" fill="none" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="80" height="24" fill="url(#grid)" />
          
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 80;
            const y = 24 - ((value - minValue) / range) * 24;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.2"
                fill={isPositive ? "#22c55e" : "#ef4444"}
                className="opacity-60"
              />
            );
          })}
          
          {/* Gradient fill under line */}
          <defs>
            <linearGradient id={`gradient-${isPositive ? 'green' : 'red'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L 80 24 L 0 24 Z`}
            fill={`url(#gradient-${isPositive ? 'green' : 'red'})`}
          />
        </svg>
      </div>
    );
  };

  // Filter markets based on search query and selected category
  const filteredMarkets = markets.filter(market => {
    // First filter by search query
    const matchesSearch = !searchQuery || 
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Then filter by category
    if (selectedCategory === 'all') return matchesSearch;
    
    const tags = market.tags?.map(tag => tag.toLowerCase()) || [];
    const category = market.category?.toLowerCase() || '';
    const name = market.name.toLowerCase();
    
    let matchesCategory = false;
    
    switch (selectedCategory) {
      case 'sports':
        matchesCategory = tags.some(tag => ['sports', 'nfl', 'football', 'soccer', 'basketball', 'nba'].includes(tag)) ||
                         category.includes('sport') || name.includes('nfl') || name.includes('premier league');
        break;
      case 'politics':
        matchesCategory = tags.some(tag => ['politics', 'election'].includes(tag)) ||
                         category.includes('politic') || name.includes('election');
        break;
      case 'crypto':
        matchesCategory = tags.some(tag => ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth'].includes(tag)) ||
                         category.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum');
        break;
      case 'technology':
        matchesCategory = tags.some(tag => ['tech', 'ai', 'technology'].includes(tag)) ||
                         category.includes('tech') || name.includes('gpt') || name.includes('ai');
        break;
      case 'entertainment':
        matchesCategory = tags.some(tag => ['entertainment', 'movie', 'avengers'].includes(tag)) ||
                         name.includes('avengers') || name.includes('movie');
        break;
      case 'health':
        matchesCategory = tags.some(tag => ['health', 'medical', 'vaccine'].includes(tag)) ||
                         name.includes('vaccine') || name.includes('cancer');
        break;
      case 'world':
        matchesCategory = tags.some(tag => ['world', 'war', 'ukraine', 'russia'].includes(tag)) ||
                         name.includes('war') || name.includes('ukraine');
        break;
      case 'economics':
        matchesCategory = tags.some(tag => ['economics', 'economy', 'finance', 'market'].includes(tag)) ||
                         category.includes('econom') || name.includes('gdp') || name.includes('inflation');
        break;
      case 'climate':
        matchesCategory = tags.some(tag => ['climate', 'environment', 'weather'].includes(tag)) ||
                         name.includes('climate') || name.includes('temperature') || name.includes('weather');
        break;
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <div className="px-6 py-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search markets to trade"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 px-4 py-2.5 bg-secondary border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors duration-200"
            />
          </div>
          
          <button className="flex items-center space-x-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-secondary hover:text-white hover:border-accent/50 shadow-md hover:shadow-lg transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
        
        {/* Rolling Carousel Strip */}
        <div className="flex-1 mx-8 overflow-hidden">
          <div className="relative h-10 bg-secondary border border-gray-600 rounded-lg overflow-hidden">
            {/* Rolling categories */}
            <div className="flex animate-scroll absolute top-0 left-0 h-full items-center space-x-8 whitespace-nowrap">
              {/* Duplicate the array twice for seamless looping */}
              {[...tradingCategories, ...tradingCategories].map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer group"
                >
                  <div 
                    className="w-2 h-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="tracking-wider">{category.name}</span>
                </div>
              ))}
            </div>
            
            {/* Matching fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-secondary via-secondary/60 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-secondary via-secondary/60 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 px-6 py-3 bg-accent text-black font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>Trending</span>
            <div className="w-2 h-2 bg-black rounded-full animate-pulse ml-1"></div>
          </button>
          <span className="text-gray-400">More</span>
        </div>
      </div>



      {/* Markets Table */}
      <div className="bg-secondary rounded-lg border border-gray-600 overflow-hidden">
        {/* Table Header */}
        <div className="grid gap-6 px-6 py-4 bg-secondary border-b border-gray-600" style={{gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr'}}>
          <div className="text-gray-400 font-medium uppercase text-sm tracking-wider">Market</div>
          <div></div> {/* Empty space for chart column */}
          <div className="text-gray-400 font-medium uppercase text-sm tracking-wider text-center">Price</div>
          <div className="text-gray-400 font-medium uppercase text-sm tracking-wider text-center">Liquidity</div>
          <div className="text-gray-400 font-medium uppercase text-sm tracking-wider text-center">Opened</div>
          <div className="text-gray-400 font-medium uppercase text-sm tracking-wider text-center">Expires</div>
        </div>

        {/* Table Body */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw size={48} className="mx-auto animate-spin text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading markets...</h3>
              <p className="text-gray-400">Fetching live data from Polymarket</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">❌</div>
              <h3 className="text-lg font-medium text-white mb-2">Error loading markets</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button 
                onClick={fetchMarkets}
                className="px-4 py-2 bg-accent text-black font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">📊</div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery ? 'No markets match your search' : 'No markets found'}
              </h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try a different search term' : 'Try refreshing or check back later'}
              </p>
            </div>
          ) : (
            filteredMarkets.map((market) => {
              const isPositive = market.priceChange24h >= 0;
              const cachedChartData = chartDataCache[market.id] || [];
              const isChartLoading = loadingCharts[market.id] || false;
              
              // Fetch chart data if not cached
              if (!chartDataCache[market.id] && !loadingCharts[market.id]) {
                fetchChartData(market.id);
              }
              
              return (
              <div 
                key={market.id}
                className="grid gap-6 px-6 py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/40 transition-colors duration-200 cursor-pointer"
                style={{gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr'}}
              >
                {/* Market Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                    {typeof getMarketIcon(market) === 'string' && getMarketIcon(market).startsWith('http') ? (
                      <img 
                        src={getMarketIcon(market)}
                        alt={market.name}
                        className="w-8 h-8 object-cover rounded"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '📊';
                          }
                        }}
                      />
                    ) : (
                      <span>{getMarketIcon(market)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium text-sm leading-tight line-clamp-2">
                      {market.name}
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-center justify-center">
                  <MiniChart 
                    data={cachedChartData} 
                    isPositive={isPositive} 
                    isLoading={isChartLoading}
                  />
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-10 bg-gray-900/80 rounded-xl border border-gray-600/50 overflow-hidden shadow-lg group">
                    {/* YES Button */}
                    <div className="absolute left-0 top-0 w-16 h-full group-hover:w-0 transition-all duration-300 ease-out z-20 hover:!w-full hover:z-30 bg-gradient-to-br from-green-400 via-green-500 to-green-600 hover:from-green-300 hover:via-green-400 hover:to-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer overflow-hidden shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                      <div className="relative w-full h-full flex flex-col items-center justify-center text-white font-bold text-xs">
                        <span className="opacity-100 text-[10px] font-semibold tracking-wide drop-shadow-lg">YES</span>
                        <span className="text-sm font-black drop-shadow-xl">{formatPrice(market.currentPrice)}</span>
                      </div>
                    </div>
                    
                    {/* NO Button */}
                    <div className="absolute right-0 top-0 w-16 h-full group-hover:w-0 transition-all duration-300 ease-out z-20 hover:!w-full hover:z-30 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] cursor-pointer overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                      <div className="relative w-full h-full flex flex-col items-center justify-center text-white font-bold text-xs">
                        <span className="opacity-100 text-[10px] font-semibold tracking-wide drop-shadow-lg">NO</span>
                        <span className="text-sm font-black drop-shadow-xl">{formatPrice(1 - market.currentPrice)}</span>
                      </div>
                    </div>
                    
                    {/* Background Fill */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-red-500/20"></div>
                    
                    {/* Divider line */}
                    <div className="absolute left-1/2 top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-gray-500/30 to-transparent transform -translate-x-0.5 z-10"></div>
                  </div>
                </div>
                
                {/* Volume */}
                <div className="flex items-center justify-center">
                  <span className="text-gray-300 text-sm font-medium">
                    {formatCurrency(market.liquidity)}
                  </span>
                </div>
                
                {/* Opened */}
                <div className="flex items-center justify-center">
                  <span className="text-gray-300 text-sm">
                    5 Oct, 2025
                  </span>
                </div>
                
                {/* Expires */}
                <div className="flex items-center justify-center">
                  <span className="text-gray-300 text-sm">
                    {formatDate(market.endDate)}
                  </span>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
    </>
  );
}
