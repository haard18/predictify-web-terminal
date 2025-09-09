'use client';

import { useState } from 'react';
import { 
  Users, 
  Bell, 
  Settings, 
  Search, 
  UserPlus, 
  UserMinus,
  Mail,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockTraders } from '../mockData';
import type { Trader } from '../types';

interface AlertConfig {
  tradeSizeMin: number;
  tradeSizeMax: number;
  categories: string[];
  outcomes: string[];
  minLiquidity: number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export default function CopyTradingPage() {
  const [traders, setTraders] = useState<Trader[]>(mockTraders);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    tradeSizeMin: 100,
    tradeSizeMax: 10000,
    categories: [],
    outcomes: [],
    minLiquidity: 50000,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });

  const categories = ['Crypto', 'Stocks', 'Economics', 'Tech', 'Sports', 'Politics'];
  const outcomes = ['Yes', 'No'];

  const handleFollowTrader = (traderId: string) => {
    setTraders(prev => prev.map(trader => 
      trader.id === traderId 
        ? { ...trader, isFollowed: !trader.isFollowed, followers: trader.followers + (trader.isFollowed ? -1 : 1) }
        : trader
    ));
  };

  const handleAlertConfigChange = (key: keyof AlertConfig, value: any) => {
    setAlertConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationToggle = (type: keyof AlertConfig['notifications']) => {
    setAlertConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setAlertConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const followedTraders = traders.filter(trader => trader.isFollowed);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const TraderCard = ({ trader }: { trader: Trader }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xl">
            {trader.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{trader.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {trader.followers.toLocaleString()} followers
            </p>
          </div>
        </div>
        <button
          onClick={() => handleFollowTrader(trader.id)}
          className={clsx(
            'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200',
            trader.isFollowed
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
          )}
        >
          {trader.isFollowed ? <UserMinus size={14} /> : <UserPlus size={14} />}
          <span>{trader.isFollowed ? 'Unfollow' : 'Follow'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPercentage(trader.winRate)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {trader.totalTrades}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
        </div>
        <div className="text-center">
          <p className={clsx(
            'text-lg font-bold',
            trader.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            +{formatPercentage(trader.roi)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
        </div>
      </div>

      {trader.isFollowed && (
        <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          <Star size={12} fill="currentColor" />
          <span>Following</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Copy Trading & Alerts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow successful traders and set up intelligent alerts for market opportunities
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Trader Discovery
          </button>
          <button className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Alert Configuration
          </button>
          <button className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Active Subscriptions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trader Discovery */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search traders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Traders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTraders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        </div>

        {/* Alert Configuration Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Bell size={18} />
              <h3 className="font-semibold text-gray-900 dark:text-white">Alert Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Trade Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trade Size Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={alertConfig.tradeSizeMin}
                    onChange={(e) => handleAlertConfigChange('tradeSizeMin', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={alertConfig.tradeSizeMax}
                    onChange={(e) => handleAlertConfigChange('tradeSizeMax', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Market Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={clsx(
                        'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200',
                        alertConfig.categories.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Liquidity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Liquidity: ${alertConfig.minLiquidity.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={alertConfig.minLiquidity}
                  onChange={(e) => handleAlertConfigChange('minLiquidity', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Methods
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Mail size={16} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Smartphone size={16} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MessageSquare size={16} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                Save Alert Settings
              </button>
            </div>
          </div>

          {/* Following Summary */}
          {followedTraders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <Users size={18} />
                <span>Following ({followedTraders.length})</span>
              </h3>
              <div className="space-y-2">
                {followedTraders.map((trader) => (
                  <div key={trader.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{trader.avatar}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {trader.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <TrendingUp size={12} />
                      <span>{formatPercentage(trader.roi)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
