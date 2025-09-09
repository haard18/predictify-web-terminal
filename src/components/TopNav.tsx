'use client';

import { useState } from 'react';
import { Menu, Search, Wallet, User, Bell, Settings } from 'lucide-react';
import { clsx } from 'clsx';

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function TopNav({ onToggleSidebar, sidebarCollapsed }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-lg lg:hidden text-gray-300 hover:text-white"
          >
            <Menu size={20} />
          </button>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={clsx(
                'pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'w-64 sm:w-80 transition-colors duration-200'
              )}
            />
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-2">
          {/* Time filters */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            {['15m', '30m', '1h', '3h', '6h', '12h', '24h'].map((time) => (
              <button
                key={time}
                className={clsx(
                  'px-2 py-1 text-xs rounded transition-colors duration-200',
                  time === '1h'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                )}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-700 rounded-lg relative text-gray-300 hover:text-white">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Premium Button */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
            <span>Get Premium</span>
          </button>

          {/* Discord */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 text-sm">
            <span className="hidden sm:inline">Join Discord</span>
          </button>

          {/* User Profile */}
          <button className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-300" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
