'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockPositions, mockMarkets } from '../mockData';
import type { Position } from '../types';

type PositionStatus = 'all' | 'open' | 'closed';

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [activeTab, setActiveTab] = useState<PositionStatus>('all');

  const filteredPositions = positions.filter(position => {
    if (activeTab === 'all') return true;
    return position.status === activeTab;
  });

  // Calculate portfolio metrics
  const totalValue = positions.reduce((sum, pos) => sum + (pos.shares * pos.currentPrice), 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalInvested = positions.reduce((sum, pos) => sum + (pos.shares * pos.avgPrice), 0);
  const openPositions = positions.filter(pos => pos.status === 'open');
  const winningPositions = positions.filter(pos => pos.pnl > 0);
  const winRate = positions.length > 0 ? (winningPositions.length / positions.length) * 100 : 0;

  const handleClosePosition = (positionId: string) => {
    setPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, status: 'closed' as const, closedAt: new Date().toISOString() }
        : pos
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon 
  }: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon size={18} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center space-x-1',
            trend === 'up' ? 'text-green-600 dark:text-green-400' :
            trend === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-gray-500 dark:text-gray-400'
          )}>
            {trend === 'up' ? <TrendingUp size={14} /> : 
             trend === 'down' ? <TrendingDown size={14} /> : null}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Portfolio
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your positions and performance across all markets
        </p>
      </div>

      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Value"
          value={formatCurrency(totalValue)}
          subtitle="Current portfolio value"
          trend={totalPnL >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(totalPnL)}
          subtitle={formatPercentage((totalPnL / totalInvested) * 100)}
          trend={totalPnL >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <MetricCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subtitle={`${winningPositions.length} of ${positions.length} positions`}
          trend={winRate >= 60 ? 'up' : winRate >= 40 ? 'neutral' : 'down'}
          icon={Target}
        />
        <MetricCard
          title="Open Positions"
          value={openPositions.length.toString()}
          subtitle={`${formatCurrency(openPositions.reduce((sum, pos) => sum + pos.pnl, 0))} unrealized P&L`}
          icon={Activity}
        />
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Performance
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Activity size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Performance chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {(['all', 'open', 'closed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm capitalize',
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                )}
              >
                {tab} {tab === 'all' ? `(${positions.length})` : 
                       tab === 'open' ? `(${openPositions.length})` : 
                       `(${positions.filter(p => p.status === 'closed').length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {position.marketName}
                      </div>
                      <div className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                        position.status === 'open'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {position.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      position.outcome === 'Yes'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    )}>
                      {position.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {position.shares.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${position.avgPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${position.currentPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={clsx(
                      'text-sm font-medium',
                      position.pnl >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {formatCurrency(position.pnl)}
                    </div>
                    <div className={clsx(
                      'text-xs',
                      position.pnlPercentage >= 0
                        ? 'text-green-500 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                    )}>
                      {formatPercentage(position.pnlPercentage)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(position.openedAt)}
                    </div>
                    {position.closedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Closed: {formatDate(position.closedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {position.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleClosePosition(position.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Close
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          Trade More
                        </button>
                      </>
                    )}
                    {position.status === 'closed' && (
                      <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPositions.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No positions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all' 
                ? "You haven't made any trades yet. Start by exploring markets in the Discover section."
                : `No ${activeTab} positions found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
