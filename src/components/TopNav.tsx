'use client';

import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { clsx } from 'clsx';

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function TopNav({ onToggleSidebar, sidebarCollapsed }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');

  return (
  <header className="bg-black border-b border-[color:var(--bg-secondary)] fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/Predictify.png" 
                alt="Predictify Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Predictify</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-8 ml-8">
            {['Discover', 'Watchlist', 'Tracker'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'text-base font-medium transition-colors duration-200',
                  activeTab === tab
          ? 'text-primary border-b-2 border-[color:var(--accent-blue)] pb-3'
          : 'text-secondary hover:text-primary pb-3'
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Center - Search */}
        

        {/* Right side - Controls and User */}
        <div className="flex items-center space-x-4">
        
 

        

       {/* Portfolio / Wallet Split Button */}
<div className="flex items-center gap-4 px-4 py-2 bg-[color:var(--bg-secondary)] border border-primary rounded-lg text-primary transition-all duration-200">
  {/* Wallet Section */}
  <button
    onClick={() => console.log("Wallet clicked")}
    className="flex items-center gap-2 hover:bg-[color:var(--bg-tertiary)] px-2 py-1 rounded-md transition-all duration-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5 text-[#7d8590]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 12h2a1 1 0 000-2h-2a1 1 0 000 2z"
      />
    </svg>
    <span className="text-sm font-mono font-semibold">$1000</span>
  </button>

  {/* Divider */}
  <div className="h-5 w-px bg-[color:var(--border-primary)]" />

  {/* Portfolio Section */}
  <button
    onClick={() => console.log("Portfolio clicked")}
    className="hover:bg-[color:var(--bg-tertiary)] px-2 py-1 rounded-md transition-all duration-200 text-sm font-medium"
  >
    Portfolio
  </button>
</div>

         

        

          {/* User Profile */}
          <button className="w-9 h-9 bg-[color:var(--bg-secondary)] rounded-full flex items-center justify-center hover:bg-[color:var(--bg-tertiary)] transition-colors duration-200 border border-[color:var(--border-primary)]">
            <User size={18} className="text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
