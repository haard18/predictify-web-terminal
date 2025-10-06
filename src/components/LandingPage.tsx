'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp, BarChart3, Shield, Users, Activity, Copy, Flame } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#010409' }}>
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0">
        {/* Static Grid Pattern Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 24px,
                rgba(34, 197, 94, 0.2) 25px,
                rgba(34, 197, 94, 0.2) 26px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 24px,
                rgba(34, 197, 94, 0.2) 25px,
                rgba(34, 197, 94, 0.2) 26px
              )
            `,
          }}
        />
        
        {/* Animated Red and Green Candlesticks Moving on Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Red Horizontal Moving Candlesticks */}
          <div className="absolute opacity-70" style={{ animation: 'moveHorizontal1 8s linear infinite' }}>
            <svg width="12" height="16" viewBox="0 0 12 16">
              <defs>
                <linearGradient id="redCandle1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <filter id="redGlow1">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <line x1="6" y1="1" x2="6" y2="15" stroke="#ef4444" strokeWidth="1" opacity="0.8"/>
              <rect x="3" y="4" width="6" height="8" fill="url(#redCandle1)" rx="1" filter="url(#redGlow1)"/>
            </svg>
          </div>
          
          <div className="absolute opacity-60" style={{ animation: 'moveHorizontal2 12s linear infinite 2s' }}>
            <svg width="10" height="14" viewBox="0 0 10 14">
              <line x1="5" y1="1" x2="5" y2="13" stroke="#f87171" strokeWidth="0.8" opacity="0.7"/>
              <rect x="2.5" y="5" width="5" height="6" fill="#f87171" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-75" style={{ animation: 'moveHorizontal3 10s linear infinite 4s' }}>
            <svg width="8" height="12" viewBox="0 0 8 12">
              <line x1="4" y1="1" x2="4" y2="11" stroke="#dc2626" strokeWidth="0.8" opacity="0.9"/>
              <rect x="2" y="3" width="4" height="6" fill="#dc2626" rx="0.5"/>
            </svg>
          </div>
          
          {/* Red Vertical Moving Candlesticks */}
          <div className="absolute opacity-65" style={{ animation: 'moveVertical1 9s linear infinite' }}>
            <svg width="10" height="14" viewBox="0 0 10 14">
              <line x1="5" y1="1" x2="5" y2="13" stroke="#ef4444" strokeWidth="0.8" opacity="0.8"/>
              <rect x="2.5" y="4" width="5" height="7" fill="#ef4444" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-55" style={{ animation: 'moveVertical2 11s linear infinite 3s' }}>
            <svg width="12" height="16" viewBox="0 0 12 16">
              <line x1="6" y1="1" x2="6" y2="15" stroke="#f87171" strokeWidth="1" opacity="0.7"/>
              <rect x="3" y="5" width="6" height="6" fill="#f87171" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-70" style={{ animation: 'moveVertical3 7s linear infinite 1s' }}>
            <svg width="8" height="12" viewBox="0 0 8 12">
              <line x1="4" y1="1" x2="4" y2="11" stroke="#dc2626" strokeWidth="0.8" opacity="0.9"/>
              <rect x="2" y="4" width="4" height="5" fill="#dc2626" rx="0.5"/>
            </svg>
          </div>
          
          {/* Green Horizontal Moving Candlesticks */}
          <div className="absolute opacity-70" style={{ animation: 'moveHorizontalGreen1 9s linear infinite 1s' }}>
            <svg width="10" height="14" viewBox="0 0 10 14">
              <defs>
                <linearGradient id="greenCandle1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <filter id="greenGlow1">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <line x1="5" y1="1" x2="5" y2="13" stroke="#22c55e" strokeWidth="0.8" opacity="0.8"/>
              <rect x="2.5" y="4" width="5" height="7" fill="url(#greenCandle1)" rx="1" filter="url(#greenGlow1)"/>
            </svg>
          </div>
          
          <div className="absolute opacity-60" style={{ animation: 'moveHorizontalGreen2 11s linear infinite 3s' }}>
            <svg width="12" height="16" viewBox="0 0 12 16">
              <line x1="6" y1="1" x2="6" y2="15" stroke="#4ade80" strokeWidth="1" opacity="0.7"/>
              <rect x="3" y="5" width="6" height="8" fill="#4ade80" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-75" style={{ animation: 'moveHorizontalGreen3 8s linear infinite 5s' }}>
            <svg width="8" height="12" viewBox="0 0 8 12">
              <line x1="4" y1="1" x2="4" y2="11" stroke="#16a34a" strokeWidth="0.8" opacity="0.9"/>
              <rect x="2" y="3" width="4" height="6" fill="#16a34a" rx="0.5"/>
            </svg>
          </div>
          
          {/* Green Vertical Moving Candlesticks */}
          <div className="absolute opacity-65" style={{ animation: 'moveVerticalGreen1 10s linear infinite 2s' }}>
            <svg width="10" height="14" viewBox="0 0 10 14">
              <line x1="5" y1="1" x2="5" y2="13" stroke="#22c55e" strokeWidth="0.8" opacity="0.8"/>
              <rect x="2.5" y="4" width="5" height="6" fill="#22c55e" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-55" style={{ animation: 'moveVerticalGreen2 12s linear infinite 4s' }}>
            <svg width="12" height="16" viewBox="0 0 12 16">
              <line x1="6" y1="1" x2="6" y2="15" stroke="#4ade80" strokeWidth="1" opacity="0.7"/>
              <rect x="3" y="6" width="6" height="6" fill="#4ade80" rx="1"/>
            </svg>
          </div>
          
          <div className="absolute opacity-70" style={{ animation: 'moveVerticalGreen3 6s linear infinite' }}>
            <svg width="8" height="12" viewBox="0 0 8 12">
              <line x1="4" y1="1" x2="4" y2="11" stroke="#16a34a" strokeWidth="0.8" opacity="0.9"/>
              <rect x="2" y="4" width="4" height="5" fill="#16a34a" rx="0.5"/>
            </svg>
          </div>
        </div>
        
        {/* CSS Animations for Red Pulses */}
        <style jsx>{`
          @keyframes moveHorizontal1 {
            0% { left: -20px; top: 15%; }
            100% { left: 100%; top: 15%; }
          }
          @keyframes moveHorizontal2 {
            0% { left: -15px; top: 45%; }
            100% { left: 100%; top: 45%; }
          }
          @keyframes moveHorizontal3 {
            0% { left: -10px; top: 75%; }
            100% { left: 100%; top: 75%; }
          }
          @keyframes moveVertical1 {
            0% { top: -20px; left: 25%; }
            100% { top: 100%; left: 25%; }
          }
          @keyframes moveVertical2 {
            0% { top: -15px; left: 55%; }
            100% { top: 100%; left: 55%; }
          }
          @keyframes moveVertical3 {
            0% { top: -10px; left: 85%; }
            100% { top: 100%; left: 85%; }
          }
          @keyframes moveHorizontalGreen1 {
            0% { left: -15px; top: 30%; }
            100% { left: 100%; top: 30%; }
          }
          @keyframes moveHorizontalGreen2 {
            0% { left: -20px; top: 60%; }
            100% { left: 100%; top: 60%; }
          }
          @keyframes moveHorizontalGreen3 {
            0% { left: -10px; top: 90%; }
            100% { left: 100%; top: 90%; }
          }
          @keyframes moveVerticalGreen1 {
            0% { top: -15px; left: 15%; }
            100% { top: 100%; left: 15%; }
          }
          @keyframes moveVerticalGreen2 {
            0% { top: -20px; left: 45%; }
            100% { top: 100%; left: 45%; }
          }
          @keyframes moveVerticalGreen3 {
            0% { top: -10px; left: 75%; }
            100% { top: 100%; left: 75%; }
          }
        `}</style>
        
        {/* Glowy Dots in Circular Form */}
        <div
          className="absolute w-[300px] h-[300px] pointer-events-none opacity-60"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            background: `
              radial-gradient(circle 3px at 15px 15px, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0.3) 30%, transparent 60%),
              radial-gradient(circle 2px at 30px 30px, rgba(34, 197, 94, 0.6) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%),
              radial-gradient(circle 2px at 45px 15px, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0.2) 35%, transparent 65%),
              radial-gradient(circle 1px at 60px 45px, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.4) 25%, transparent 55%)
            `,
            backgroundSize: '30px 30px, 60px 60px, 30px 30px, 15px 15px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 40%, transparent 70%)',
            filter: 'blur(0.5px)',
          }}
        />
        
        {/* Inner Concentrated Dots */}
        <div
          className="absolute w-[200px] h-[200px] pointer-events-none opacity-40"
          style={{
            left: mousePosition.x - 100,
            top: mousePosition.y - 100,
            background: `
              radial-gradient(circle 2px at 20px 20px, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.5) 20%, transparent 50%),
              radial-gradient(circle 1px at 10px 30px, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0.3) 30%, transparent 60%),
              radial-gradient(circle 1px at 35px 10px, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.4) 25%, transparent 55%),
              radial-gradient(circle 1px at 5px 5px, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%)
            `,
            backgroundSize: '40px 40px, 20px 20px, 30px 30px, 10px 10px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 30%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 30%, transparent 60%)',
            filter: 'blur(0.3px)',
          }}
        />

        {/* Animated Graph Lines */}
        <svg className="absolute bottom-0 w-full h-[300px] opacity-60" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="graphLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#16a34a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
              <stop offset="12%" stopColor="#22c55e" stopOpacity="0.05" />
              <stop offset="28%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="35%" stopColor="#22c55e" stopOpacity="0.15" />
              <stop offset="52%" stopColor="#22c55e" stopOpacity="0.45" />
              <stop offset="63%" stopColor="#22c55e" stopOpacity="0.2" />
              <stop offset="78%" stopColor="#22c55e" stopOpacity="0.1" />
              <stop offset="89%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.08" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="dotGlow">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Fill area */}
          <path
            d="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180 L1200,300 L0,300 Z"
            fill="url(#graphLine)"
            className="animate-pulse"
          />
          
          {/* Glow layer */}
          <path
            d="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            stroke="url(#glowGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            opacity="0.5"
          />
          
          {/* Secondary glow layer - uneven */}
          <path
            d="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            stroke="url(#glowGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
            filter="url(#glow)"
          />
          
          {/* Main sharp line */}
          <path
            d="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          
          {/* Animated Crawling Dots */}
          <circle r="4" fill="#22c55e" opacity="0.8">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              path="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            />
          </circle>
          
          <circle r="3" fill="#22c55e" opacity="0.6">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              begin="2s"
              path="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            />
          </circle>
          
          <circle r="2" fill="#22c55e" opacity="0.9">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin="1s"
              path="M0,220 L80,180 L120,240 L200,160 L250,200 L320,90 L380,130 L450,50 L520,180 L580,140 L650,220 L720,100 L800,70 L880,160 L950,110 L1020,200 L1100,140 L1200,180"
            />
          </circle>
        </svg>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-24">
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Headline with Frame and Candlestick Animations */}
          <div className="relative mb-6">
            {/* Frame Box */}
            <div className="relative border-2 border-dotted border-[#30363d] rounded-2xl p-8 md:p-12 bg-[#161b22]/30 backdrop-blur-sm">
              {/* Animated Border Glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#22c55e]/20 animate-pulse"></div>
              
              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl text-[#f0f6fc] leading-tight relative z-10">
                Trade With <span className="text-[#22c55e] font-bold">Predictify</span> Faster
              </h1>
            </div>
          </div>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[#7d8590] max-w-2xl mx-auto mb-8">
            Trade faster and smarter with our secure AI bots. Maximize your investments with
            real-time insights and automation.
          </p>

          {/* Feature Categories */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#30363d] bg-[#161b22]/50 text-[#22c55e]">
              <Activity className="w-4 h-4" />
              <span>Telegram Bot</span>
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#30363d] bg-[#161b22]/50 text-[#58a6ff]">
              <BarChart3 className="w-4 h-4" />
              <span>Markets</span>
              <div className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#30363d] bg-[#161b22]/50 text-[#f85149]">
              <Activity className="w-4 h-4" />
              <span>Alerts</span>
              <div className="w-2 h-2 rounded-full bg-[#f85149] animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#30363d] bg-[#161b22]/50 text-[#a855f7]">
              <Users className="w-4 h-4" />
              <span>Copy-Trading</span>
              <div className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            </div>
          </div>

          {/* Get Started Button */}
          <button
            onClick={() => router.push('/discover')}
            className="group inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl
                     bg-gradient-to-r from-[#22c55e] to-[#16a34a]
                     hover:from-[#16a34a] hover:to-[#15803d]
                     transition-all duration-300 shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40 hover:scale-105"
          >
            <span className="text-lg">Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </main>

      {/* --- BOTTOM NAV --- */}
      <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center space-x-8 px-8 py-4 rounded-2xl bg-[#161b22]/80 backdrop-blur-md border border-[#30363d]">
          <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Bots" active />
          <NavItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Markets" 
            onClick={() => router.push('/discover')}
          />
          <NavItem 
            icon={<Activity className="w-5 h-5" />} 
            label="Trade" 
            onClick={() => router.push('/discover')}
          />
          <NavItem icon={<Copy className="w-5 h-5" />} label="Copy Trade" />
          <NavItem icon={<Flame className="w-5 h-5" />} label="Trending" />
          <div 
            onClick={() => router.push('/discover')}
            className="w-12 h-12 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center text-xs font-medium cursor-pointer transition-all duration-200 ${
        active ? 'text-[#22c55e]' : 'text-[#7d8590] hover:text-[#f0f6fc]'
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          active ? 'bg-[#22c55e]/10' : 'hover:bg-[#30363d]'
        } transition-all duration-200`}
      >
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}