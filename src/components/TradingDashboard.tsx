'use client';

import { useState } from 'react';
import TopNav from './TopNav';
import DiscoverPage from './pages/DiscoverPage';
import WatchlistPage from './pages/WatchlistPage';
import LiveFeedPage from './pages/LiveFeedPage';
import CopyTradingPage from './pages/CopyTradingPage';
import PortfolioPage from './pages/PortfolioPage';
import HighProbabilityPage from './pages/HighProbabilityPage';

export type NavigationSection = 'discover' | 'watchlist' | 'live-feed' | 'copy-trading' | 'portfolio' | 'high-probability';

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
    <div className="min-h-screen bg-primary text-white">
      {/* Top Navigation - Fixed */}
      <TopNav 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content with top padding for fixed navbar */}
      <div className="pt-16"> 
        {/* Page Content */}
        <main className="bg-primary min-h-screen">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
