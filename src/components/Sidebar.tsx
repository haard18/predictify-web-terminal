'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';
import type { NavigationItem, NavigationSection } from './TradingDashboard';

interface SidebarProps {
  navigationItems: NavigationItem[];
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  navigationItems,
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64',
        'hidden lg:block'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={clsx(
            'flex items-center p-4 border-b border-gray-700',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              {!collapsed && (
                <span className="text-xl font-bold text-white">
                  Predictify
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={clsx(
                      'w-full flex items-center p-3 rounded-lg transition-all duration-200',
                      'hover:bg-gray-700/50',
                      activeSection === item.id
                        ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                        : 'text-gray-300 hover:text-white',
                      collapsed ? 'justify-center' : 'justify-start space-x-3'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={20} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-50 lg:hidden',
        collapsed ? '-translate-x-full' : 'translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-white">
                Predictify
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      onToggleCollapse(); // Close mobile sidebar after selection
                    }}
                    className={clsx(
                      'w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                      'hover:bg-gray-700/50',
                      activeSection === item.id
                        ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                        : 'text-gray-300 hover:text-white'
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
