'use client';

import { clsx } from 'clsx';
import { Eye, Share, Clock, TrendingUp } from 'lucide-react';
import type { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
  onShare?: (newsId: string) => void;
  relatedMarkets?: Array<{ id: string; name: string; correlation: number }>;
}

export default function NewsCard({ news, onShare, relatedMarkets }: NewsCardProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    return date.toLocaleDateString();
  };

  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'negative':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2">
            {news.headline}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{news.source}</span>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{formatTimestamp(news.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium',
          getSentimentColor(news.sentiment)
        )}>
          {news.sentiment}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye size={12} />
            <span>{news.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share size={12} />
            <span>{news.shares}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          {news.category}
        </span>
      </div>

      {/* Related Markets */}
      {relatedMarkets && relatedMarkets.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={12} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Related Markets
            </span>
          </div>
          <div className="space-y-1">
            {relatedMarkets.slice(0, 2).map((market) => (
              <div key={market.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                  {market.name}
                </span>
                <span className={clsx(
                  'font-medium',
                  market.correlation > 0.7 ? 'text-green-600 dark:text-green-400' : 
                  market.correlation > 0.4 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-gray-500 dark:text-gray-400'
                )}>
                  {(market.correlation * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onShare?.(news.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
        >
          <Share size={12} />
          <span>Share</span>
        </button>
        <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors duration-200">
          View More
        </button>
      </div>
    </div>
  );
}
