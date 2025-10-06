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
    <div className="min-h-screen text-[#f0f6fc]" style={{ backgroundColor: '#0d1117' }}>
      {/* Top Navigation - Fixed */}
      <TopNav 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content with top padding for fixed navbar */}
      <div className="pt-16"> 
        {/* Page Content */}
        <main className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
