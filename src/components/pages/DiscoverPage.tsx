'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { polymarketAPI, PolymarketMarket } from '@/lib/polymarket-api';
import FilterModal, { FilterOptions } from '@/components/shared/FilterModal';

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
  const [sortBy, setSortBy] = useState<'price' | 'liquidity' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 100 },
    liquidityRange: { min: 0, max: 10000000 },
    searchKeywords: [],
    sortBy: 'volume',
    showActiveOnly: true
  });
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

  // Sorting function
  const handleSort = (column: 'price' | 'liquidity') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Filter application function
  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.categories.length > 0) count++;
    if (activeFilters.searchKeywords.length > 0) count++;
    if (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 100) count++;
    if (activeFilters.liquidityRange.min > 0 || activeFilters.liquidityRange.max < 10000000) count++;
    if (!activeFilters.showActiveOnly) count++;
    return count;
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

  // Filter and sort markets based on search query, active filters, and sorting preferences
  const filteredMarkets = markets.filter(market => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Active only filter
    if (activeFilters.showActiveOnly && !market.active) return false;

    // Category filter from advanced filters
    if (activeFilters.categories.length > 0) {
      const tags = market.tags?.map(tag => tag.toLowerCase()) || [];
      const category = market.category?.toLowerCase() || '';
      const name = market.name.toLowerCase();
      
      const matchesCategory = activeFilters.categories.some(filterCategory => {
        switch (filterCategory) {
          case 'crypto':
            return tags.some(tag => ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth'].includes(tag)) ||
                   category.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum');
          case 'politics':
            return tags.some(tag => ['politics', 'election'].includes(tag)) ||
                   category.includes('politic') || name.includes('election');
          case 'sports':
            return tags.some(tag => ['sports', 'nfl', 'football', 'soccer', 'basketball', 'nba'].includes(tag)) ||
                   category.includes('sport') || name.includes('nfl') || name.includes('premier league');
          case 'tech':
            return tags.some(tag => ['tech', 'ai', 'technology'].includes(tag)) ||
                   category.includes('tech') || name.includes('gpt') || name.includes('ai');
          case 'entertainment':
            return tags.some(tag => ['entertainment', 'movie', 'avengers'].includes(tag)) ||
                   name.includes('avengers') || name.includes('movie');
          case 'health':
            return tags.some(tag => ['health', 'medical', 'vaccine'].includes(tag)) ||
                   name.includes('vaccine') || name.includes('cancer');
          case 'world':
            return tags.some(tag => ['world', 'war', 'ukraine', 'russia'].includes(tag)) ||
                   name.includes('war') || name.includes('ukraine');
          case 'economics':
            return tags.some(tag => ['economics', 'economy', 'finance', 'market'].includes(tag)) ||
                   category.includes('econom') || name.includes('gdp') || name.includes('inflation');
          case 'climate':
            return tags.some(tag => ['climate', 'environment', 'weather'].includes(tag)) ||
                   name.includes('climate') || name.includes('temperature') || name.includes('weather');
          default:
            return false;
        }
      });
      
      if (!matchesCategory) return false;
    }

    // Legacy category filter (for backward compatibility with carousel)
    if (selectedCategory !== 'all') {
      const tags = market.tags?.map(tag => tag.toLowerCase()) || [];
      const category = market.category?.toLowerCase() || '';
      const name = market.name.toLowerCase();
      
      let matchesLegacyCategory = false;
      
      switch (selectedCategory) {
        case 'sports':
          matchesLegacyCategory = tags.some(tag => ['sports', 'nfl', 'football', 'soccer', 'basketball', 'nba'].includes(tag)) ||
                           category.includes('sport') || name.includes('nfl') || name.includes('premier league');
          break;
        case 'politics':
          matchesLegacyCategory = tags.some(tag => ['politics', 'election'].includes(tag)) ||
                           category.includes('politic') || name.includes('election');
          break;
        case 'crypto':
          matchesLegacyCategory = tags.some(tag => ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth'].includes(tag)) ||
                           category.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum');
          break;
        case 'technology':
          matchesLegacyCategory = tags.some(tag => ['tech', 'ai', 'technology'].includes(tag)) ||
                           category.includes('tech') || name.includes('gpt') || name.includes('ai');
          break;
        case 'entertainment':
          matchesLegacyCategory = tags.some(tag => ['entertainment', 'movie', 'avengers'].includes(tag)) ||
                           name.includes('avengers') || name.includes('movie');
          break;
        case 'health':
          matchesLegacyCategory = tags.some(tag => ['health', 'medical', 'vaccine'].includes(tag)) ||
                           name.includes('vaccine') || name.includes('cancer');
          break;
        case 'world':
          matchesLegacyCategory = tags.some(tag => ['world', 'war', 'ukraine', 'russia'].includes(tag)) ||
                           name.includes('war') || name.includes('ukraine');
          break;
        case 'economics':
          matchesLegacyCategory = tags.some(tag => ['economics', 'economy', 'finance', 'market'].includes(tag)) ||
                           category.includes('econom') || name.includes('gdp') || name.includes('inflation');
          break;
        case 'climate':
          matchesLegacyCategory = tags.some(tag => ['climate', 'environment', 'weather'].includes(tag)) ||
                           name.includes('climate') || name.includes('temperature') || name.includes('weather');
          break;
      }
      
      if (!matchesLegacyCategory) return false;
    }

    // Price range filter
    const priceInCents = Math.round(market.currentPrice * 100);
    if (priceInCents < activeFilters.priceRange.min || priceInCents > activeFilters.priceRange.max) {
      return false;
    }

    // Liquidity range filter
    if (market.liquidity < activeFilters.liquidityRange.min || market.liquidity > activeFilters.liquidityRange.max) {
      return false;
    }

    // Search keywords filter
    if (activeFilters.searchKeywords.length > 0) {
      const searchableText = `${market.name} ${market.description} ${market.category} ${market.tags?.join(' ')}`.toLowerCase();
      const hasAllKeywords = activeFilters.searchKeywords.every(keyword => 
        searchableText.includes(keyword.toLowerCase())
      );
      if (!hasAllKeywords) return false;
    }

    return matchesSearch;
  }).sort((a, b) => {
    // Apply sorting if a sort column is selected
    if (!sortBy) return 0;
    
    let aValue: number, bValue: number;
    
    if (sortBy === 'price') {
      aValue = a.currentPrice;
      bValue = b.currentPrice;
    } else if (sortBy === 'liquidity') {
      aValue = a.liquidity;
      bValue = b.liquidity;
    } else {
      return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <div className="px-6 py-6 bg-[#0d1117] min-h-screen">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#f0f6fc] placeholder-[#7d8590] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] text-sm transition-all duration-200"
            />
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${
              getActiveFilterCount() > 0 
                ? 'border-[#58a6ff] text-[#58a6ff] bg-[#0d1117] hover:bg-[#161b22]'
                : 'border-[#30363d] text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span>Filter</span>
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#58a6ff] text-white text-xs rounded-full min-w-[18px] text-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>
        
        {/* Rolling Carousel Strip */}
        <div className="flex-1 mx-6 overflow-hidden">
          <div className="relative h-8 bg-[#0d1117] border border-[#21262d] rounded-md overflow-hidden">
            {/* Rolling categories */}
            <div className="flex animate-scroll absolute top-0 left-0 h-full items-center space-x-6 whitespace-nowrap">
              {/* Duplicate the array twice for seamless looping */}
              {[...tradingCategories, ...tradingCategories].map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-[#7d8590] hover:text-[#f0f6fc] transition-colors duration-200 cursor-pointer group"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="tracking-wide">{category.name}</span>
                </div>
              ))}
            </div>
            
            {/* Matching fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/60 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d1117] via-[#0d1117]/60 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#238636] text-white font-medium rounded-md hover:bg-[#2ea043] text-sm transition-all duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>Trending</span>
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-1"></div>
          </button>
          <button className="text-[#7d8590] hover:text-[#f0f6fc] text-sm font-medium transition-colors duration-200">
            More
          </button>
        </div>
      </div>



      {/* Markets Table */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-md overflow-hidden">
        {/* Table Header */}
        <div className="grid gap-4 px-4 py-3 bg-[#161b22] border-b border-[#21262d]" style={{gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 1fr'}}>
          <div className="text-[#7d8590] font-semibold text-xs tracking-wide flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-5.586L4.293 6.707A1 1 0 014 6V4z" clipRule="evenodd" />
            </svg>
            Name
          </div>
          <div className="text-[#7d8590] font-semibold text-xs tracking-wide text-center">Chart</div>
          <button 
            onClick={() => handleSort('price')}
            className="text-[#7d8590] hover:text-[#f0f6fc] font-semibold text-xs tracking-wide flex items-center justify-center space-x-1 transition-colors duration-150 group"
          >
            <span>Price</span>
            <div className="flex flex-col ml-1">
              <svg 
                className={`w-4 h-4 transition-colors duration-150 ${
                  sortBy === 'price' && sortOrder === 'desc' 
                    ? 'text-[#58a6ff]' 
                    : 'text-[#7d8590] group-hover:text-[#f0f6fc]'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <svg 
                className={`w-4 h-4 -mt-1.5 transition-colors duration-150 ${
                  sortBy === 'price' && sortOrder === 'asc' 
                    ? 'text-[#58a6ff]' 
                    : 'text-[#7d8590] group-hover:text-[#f0f6fc]'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          <button 
            onClick={() => handleSort('liquidity')}
            className="text-[#7d8590] hover:text-[#f0f6fc] font-semibold text-xs tracking-wide flex items-center justify-center space-x-1 transition-colors duration-150 group"
          >
            <span>Liquidity</span>
            <div className="flex flex-col ml-1">
              <svg 
                className={`w-4 h-4 transition-colors duration-150 ${
                  sortBy === 'liquidity' && sortOrder === 'desc' 
                    ? 'text-[#58a6ff]' 
                    : 'text-[#7d8590] group-hover:text-[#f0f6fc]'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <svg 
                className={`w-4 h-4 -mt-1.5 transition-colors duration-150 ${
                  sortBy === 'liquidity' && sortOrder === 'asc' 
                    ? 'text-[#58a6ff]' 
                    : 'text-[#7d8590] group-hover:text-[#f0f6fc]'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          <div className="text-[#7d8590] font-semibold text-xs tracking-wide text-center">Opened</div>
          <div className="text-[#7d8590] font-semibold text-xs tracking-wide text-center">Expires</div>
        </div>

        {/* Table Body */}
        <div>
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw size={32} className="mx-auto animate-spin text-[#7d8590] mb-4" />
              <h3 className="text-base font-medium text-[#f0f6fc] mb-2">Loading markets...</h3>
              <p className="text-[#7d8590] text-sm">Fetching live data from Polymarket</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#da3633]/10">
                <svg className="w-6 h-6 text-[#f85149]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-[#f0f6fc] mb-2">Error loading markets</h3>
              <p className="text-[#7d8590] text-sm mb-4">{error}</p>
              <button 
                onClick={fetchMarkets}
                className="px-4 py-2 bg-[#238636] text-white font-medium rounded-md hover:bg-[#2ea043] text-sm transition-colors duration-150"
              >
                Try Again
              </button>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#7d8590]/10">
                <svg className="w-6 h-6 text-[#7d8590]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-[#f0f6fc] mb-2">
                {searchQuery ? 'No markets match your search' : 'No markets found'}
              </h3>
              <p className="text-[#7d8590] text-sm">
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
                className="grid gap-4 px-4 py-3 border-b border-[#21262d] last:border-b-0 hover:bg-[#161b22] transition-colors duration-150 cursor-pointer group"
                style={{gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 1fr'}}
                onMouseEnter={() => setHoveredRow(market.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Market Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-base">
                    {typeof getMarketIcon(market) === 'string' && getMarketIcon(market).startsWith('http') ? (
                      <img 
                        src={getMarketIcon(market)}
                        alt={market.name}
                        className="w-6 h-6 object-cover rounded"
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
                      <span className="text-[#7d8590] group-hover:text-[#58a6ff] transition-colors duration-150">{getMarketIcon(market)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[#58a6ff] font-medium text-sm leading-tight line-clamp-2 group-hover:underline">
                      {market.name}
                    </div>
                    <div className="text-[#7d8590] text-xs mt-0.5 truncate">
                      {market.category || 'Prediction Market'}
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-center justify-center">
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-150">
                    <MiniChart 
                      data={cachedChartData} 
                      isPositive={isPositive} 
                      isLoading={isChartLoading}
                    />
                  </div>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-center">
                  <div className="relative w-28 h-8 bg-[#21262d] rounded-lg border border-[#30363d] overflow-hidden">
                    {/* YES Button */}
                    <div className="absolute left-0 top-0 w-14 h-full transition-all duration-400 ease-out hover:w-full hover:z-30 bg-[#238636] hover:bg-[#2ea043] cursor-pointer overflow-hidden group hover:shadow-md">
                      <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
                        <span className="text-[9px] font-medium tracking-wider opacity-90 group-hover:opacity-100 transition-opacity duration-200">YES</span>
                        <span className="text-xs font-bold mt-0.5 group-hover:text-sm transition-all duration-200">{formatPrice(market.currentPrice)}</span>
                      </div>
                    </div>
                    
                    {/* NO Button */}
                    <div className="absolute right-0 top-0 w-14 h-full transition-all duration-400 ease-out hover:w-full hover:z-30 bg-[#da3633] hover:bg-[#f85149] cursor-pointer overflow-hidden group hover:shadow-md">
                      <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
                        <span className="text-[9px] font-medium tracking-wider opacity-90 group-hover:opacity-100 transition-opacity duration-200">NO</span>
                        <span className="text-xs font-bold mt-0.5 group-hover:text-sm transition-all duration-200">{formatPrice(1 - market.currentPrice)}</span>
                      </div>
                    </div>
                    
                    {/* Subtle divider */}
                    <div className="absolute left-1/2 top-1 bottom-1 w-px bg-[#30363d] transform -translate-x-0.5 z-10"></div>
                  </div>
                </div>
                
                {/* Volume */}
                <div className="flex items-center justify-center">
                  <span className="text-[#f0f6fc] text-sm font-medium">
                    {formatCurrency(market.liquidity)}
                  </span>
                </div>
                
                {/* Opened */}
                <div className="flex items-center justify-center">
                  <span className="text-[#7d8590] text-sm font-mono">
                    Oct 5, 2025
                  </span>
                </div>
                
                {/* Expires */}
                <div className="flex items-center justify-center">
                  <span className="text-[#7d8590] text-sm font-mono">
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

    {/* Filter Modal */}
    <FilterModal
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      onApplyFilters={applyFilters}
      currentFilters={activeFilters}
    />
    </>
  );
}
