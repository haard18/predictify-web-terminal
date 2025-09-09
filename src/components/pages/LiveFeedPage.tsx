'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, Filter, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import NewsCard from '../shared/NewsCard';
import MarketCard from '../shared/MarketCard';
import { mockNews, mockMarkets } from '../mockData';
import type { NewsItem, Market } from '../types';

export default function LiveFeedPage() {
  const [news] = useState<NewsItem[]>(mockNews);
  const [markets] = useState<Market[]>(mockMarkets);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique categories from news
  const categories = useMemo(() => {
    const newsCategories = Array.from(new Set(news.map(item => item.category)));
    return ['all', ...newsCategories];
  }, [news]);

  // Filter news by category
  const filteredNews = useMemo(() => {
    if (selectedCategory === 'all') return news;
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  // Get related markets for each news item
  const getRelatedMarkets = (newsItem: NewsItem) => {
    return newsItem.marketIds.map(marketId => {
      const market = markets.find(m => m.id === marketId);
      if (!market) return null;
      
      // Simulate correlation based on category match and sentiment
      let correlation = 0.5;
      if (market.category.toLowerCase() === newsItem.category.toLowerCase()) {
        correlation += 0.3;
      }
      if (newsItem.sentiment === 'positive') {
        correlation += 0.1;
      } else if (newsItem.sentiment === 'negative') {
        correlation += 0.05;
      }
      
      return {
        id: market.id,
        name: market.name,
        correlation: Math.min(correlation, 0.95)
      };
    }).filter(Boolean) as Array<{ id: string; name: string; correlation: number }>;
  };

  // Get trending markets (highest volume or recent price changes)
  const trendingMarkets = useMemo(() => {
    return [...markets]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 4);
  }, [markets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleShare = (newsId: string) => {
    console.log('Share news:', newsId);
  };

  const handleToggleWatch = (marketId: string) => {
    console.log('Toggle watch for market:', marketId);
  };

  const handleTrade = (marketId: string) => {
    console.log('Trade clicked for market:', marketId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
            <span>Live Feed</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time news and market updates with correlation analysis
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200',
            isRefreshing && 'cursor-not-allowed'
          )}
        >
          <RefreshCw size={16} className={clsx(isRefreshing && 'animate-spin')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter size={16} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filter by Category</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200',
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Feed - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Latest News
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredNews.length} articles
            </span>
          </div>

          <div className="space-y-4">
            {filteredNews.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onShare={handleShare}
                relatedMarkets={getRelatedMarkets(newsItem)}
              />
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No news found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No articles found for the selected category
              </p>
            </div>
          )}
        </div>

        {/* Trending Markets - Right Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trending Markets
            </h2>
          </div>

          <div className="space-y-4">
            {trendingMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onToggleWatch={handleToggleWatch}
                onTrade={handleTrade}
              />
            ))}
          </div>

          {/* Live Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Stats</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume 24h</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">$2.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Markets</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Traders</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">12,890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">News Articles</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
