'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Play,
  Pause,
  Settings,
  BarChart3,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockStrategies } from '../mockData';
import type { Strategy } from '../types';

export default function HighProbabilityPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(strategies.map(s => s.category)))];

  const filteredStrategies = selectedCategory === 'all' 
    ? strategies 
    : strategies.filter(s => s.category === selectedCategory);

  const handleSubscribe = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { 
            ...strategy, 
            isSubscribed: !strategy.isSubscribed,
            subscribers: strategy.subscribers + (strategy.isSubscribed ? -1 : 1)
          }
        : strategy
    ));
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Create sparkline data visualization (simplified)
  const Sparkline = ({ data, className }: { data: number[]; className?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className={clsx('flex items-end space-x-0.5 h-8', className)}>
        {data.map((value, index) => {
          const height = range === 0 ? 50 : ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="bg-blue-500 w-1 rounded-t-sm"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  const StrategyCard = ({ strategy }: { strategy: Strategy }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {strategy.name}
            </h3>
            {strategy.isSubscribed && (
              <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <CheckCircle size={12} fill="currentColor" />
                <span>Active</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {strategy.description}
          </p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            {strategy.category}
          </span>
        </div>
        <button
          onClick={() => handleSubscribe(strategy.id)}
          className={clsx(
            'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200',
            strategy.isSubscribed
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
          )}
        >
          {strategy.isSubscribed ? <Pause size={14} /> : <Play size={14} />}
          <span>{strategy.isSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatPercentage(strategy.winRate)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            +{formatPercentage(strategy.roi)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {strategy.totalTrades}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trades</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            12-Month Performance
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {strategy.subscribers.toLocaleString()} subscribers
          </span>
        </div>
        <Sparkline data={strategy.performance} />
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1">
          <BarChart3 size={14} />
          <span>View Details</span>
        </button>
        <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200">
          <Settings size={14} />
        </button>
      </div>
    </div>
  );

  const subscribedStrategies = strategies.filter(s => s.isSubscribed);
  const totalROI = subscribedStrategies.reduce((sum, s) => sum + s.roi, 0) / (subscribedStrategies.length || 1);
  const avgWinRate = subscribedStrategies.reduce((sum, s) => sum + s.winRate, 0) / (subscribedStrategies.length || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          High-Probability Strategies
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Subscribe to proven trading strategies and receive intelligent alerts for high-probability opportunities
        </p>
      </div>

      {/* Dashboard Summary */}
      {subscribedStrategies.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Active Strategies</h2>
            <div className="flex items-center space-x-1">
              <Star size={18} fill="currentColor" />
              <span className="font-medium">{subscribedStrategies.length} Active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">+{formatPercentage(totalROI)}</p>
              <p className="text-blue-100">Average ROI</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatPercentage(avgWinRate)}</p>
              <p className="text-blue-100">Average Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {subscribedStrategies.reduce((sum, s) => sum + s.totalTrades, 0)}
              </p>
              <p className="text-blue-100">Total Signals</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Strategy Categories</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredStrategies.length} strategies
          </span>
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
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Setup Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <AlertCircle size={18} className="text-blue-600" />
          <span>Quick Setup Templates</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left">
            <div className="font-medium text-gray-900 dark:text-white mb-1">Conservative</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">High win rate, low risk strategies</div>
          </button>
          <button className="p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left">
            <div className="font-medium text-gray-900 dark:text-white mb-1">Aggressive</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">High ROI, higher risk strategies</div>
          </button>
          <button className="p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left">
            <div className="font-medium text-gray-900 dark:text-white mb-1">Balanced</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moderate risk-reward balance</div>
          </button>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStrategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No strategies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No strategies found for the selected category
          </p>
        </div>
      )}
    </div>
  );
}
