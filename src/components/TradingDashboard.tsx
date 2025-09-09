'use client';

import { useState } from 'react';
import { 
  Compass, 
  Star, 
  Rss, 
  Users, 
  PieChart, 
  TrendingUp,
  Menu,
  X,
  Search,
  Wallet,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import DiscoverPage from './pages/DiscoverPage';
import WatchlistPage from './pages/WatchlistPage';
import LiveFeedPage from './pages/LiveFeedPage';
import CopyTradingPage from './pages/CopyTradingPage';
import PortfolioPage from './pages/PortfolioPage';
import HighProbabilityPage from './pages/HighProbabilityPage';

export type NavigationSection = 'discover' | 'watchlist' | 'live-feed' | 'copy-trading' | 'portfolio' | 'high-probability';

export interface NavigationItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'live-feed', label: 'Live Feed', icon: Rss },
  { id: 'copy-trading', label: 'Copy Trading & Alerts', icon: Users },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'high-probability', label: 'High-Probability', icon: TrendingUp },
];

export default function TradingDashboard() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('discover');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (activeSection) {
      case 'discover':
        return <DiscoverPage />;
      case 'watchlist':
        return <WatchlistPage />;
      case 'live-feed':
        return <LiveFeedPage />;
      case 'copy-trading':
        return <CopyTradingPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'high-probability':
        return <HighProbabilityPage />;
      default:
        return <DiscoverPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        navigationItems={navigationItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className={clsx(
        'flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Top Navigation */}
        <TopNav 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-gray-900">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
