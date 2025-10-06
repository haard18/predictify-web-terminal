'use client';

import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Eye, Star, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Market } from '../types';

interface MarketCardProps {
  market: Market;
  onToggleWatch?: (marketId: string) => void;
  onTrade?: (marketId: string) => void;
  showWatchButton?: boolean;
  showTradeButton?: boolean;
}

export default function MarketCard({ 
  market, 
  onToggleWatch, 
  onTrade,
  showWatchButton = true,
  showTradeButton = true 
}: MarketCardProps) {
  const router = useRouter();
  const isPositive = market.priceChange24h >= 0;
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleCardClick = () => {
    router.push(`/market/${market.id}`);
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking watch button
    onToggleWatch?.(market.id);
  };

  return (
    <div 
      className="bg-gray-800 border border-gray-700 p-4 hover:bg-gray-750 transition-colors duration-200 group cursor-pointer hover:border-blue-500/50"
      onClick={handleCardClick}
    >
      {/* Header with mini chart area */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="font-medium text-white text-sm leading-tight mb-1 group-hover:text-blue-400 transition-colors">
            {market.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2">
            {market.description}
          </p>
        </div>
        {/* Mini chart placeholder */}
        <div className="w-16 h-8 bg-gray-700 rounded flex items-end justify-center space-x-px p-1">
          {/* Simulate mini sparkline */}
          {[3, 5, 2, 7, 4, 6, 8].map((height, i) => (
            <div
              key={i}
              className={clsx(
                'w-1 rounded-t-sm',
                isPositive ? 'bg-green-500' : 'bg-red-500'
              )}
              style={{ height: `${height * 3}px` }}
            />
          ))}
        </div>
      </div>

      {/* Price and metrics row */}
      <div className="grid grid-cols-5 gap-4 text-center">
        {/* Price */}
        <div>
          <p className="text-lg font-bold text-white">
            {market.currentPrice.toFixed(2)}¢
          </p>
        </div>
        
        {/* Change */}
        <div className={clsx(
          'text-sm font-medium',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {isPositive ? '+' : ''}{formatPercentage(market.priceChange24h)}
        </div>
        
        {/* Volume */}
        <div>
          <p className="text-sm text-gray-300">
            {formatCurrency(market.volume24h)}
          </p>
        </div>
        
        {/* Liquidity */}
        <div>
          <p className="text-sm text-gray-300">
            {formatCurrency(market.liquidity)}
          </p>
        </div>
        
        {/* Status and Watch */}
        <div className="flex items-center justify-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
            active
          </span>
          {showWatchButton && (
            <button
              onClick={handleWatchClick}
              className={clsx(
                'p-1 rounded transition-colors duration-200',
                market.isWatched
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-gray-500 hover:text-yellow-400'
              )}
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
