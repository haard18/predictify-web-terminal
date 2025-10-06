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
        {/* Gradient Glow */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
            left: mousePosition.x - 350,
            top: mousePosition.y - 350,
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
              {/* Animated Corner Candlesticks */}
              
              {/* Top Left Corner */}
              <div className="absolute -top-1 -left-1 w-8 h-8">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <defs>
                    <linearGradient id="candleGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="candleRed" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  
                  {/* Candlestick 1 */}
                  <g>
                    <line x1="6" y1="4" x2="6" y2="28" stroke="#22c55e" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="4" y="8" width="4" height="12" fill="url(#candleGreen)" rx="1">
                      <animate attributeName="height" values="12;8;16;12" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="y" values="8;12;4;8" dur="3s" repeatCount="indefinite"/>
                    </rect>
                  </g>
                  
                  {/* Candlestick 2 */}
                  <g>
                    <line x1="12" y1="6" x2="12" y2="26" stroke="#ef4444" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="10" y="10" width="4" height="8" fill="url(#candleRed)" rx="1">
                      <animate attributeName="height" values="8;12;6;8" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
                      <animate attributeName="y" values="10;6;12;10" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
                    </rect>
                  </g>
                  
                  {/* Candlestick 3 */}
                  <g>
                    <line x1="18" y1="2" x2="18" y2="30" stroke="#22c55e" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="16" y="6" width="4" height="18" fill="url(#candleGreen)" rx="1">
                      <animate attributeName="height" values="18;14;22;18" dur="4s" repeatCount="indefinite" begin="1s"/>
                      <animate attributeName="y" values="6;10;2;6" dur="4s" repeatCount="indefinite" begin="1s"/>
                    </rect>
                  </g>
                </svg>
              </div>

              {/* Top Right Corner */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rotate-90">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <g>
                    <line x1="6" y1="4" x2="6" y2="28" stroke="#58a6ff" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="4" y="8" width="4" height="12" fill="#58a6ff" rx="1">
                      <animate attributeName="height" values="12;16;8;12" dur="3.5s" repeatCount="indefinite"/>
                      <animate attributeName="y" values="8;4;12;8" dur="3.5s" repeatCount="indefinite"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="12" y1="6" x2="12" y2="26" stroke="#22c55e" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="10" y="10" width="4" height="8" fill="url(#candleGreen)" rx="1">
                      <animate attributeName="height" values="8;6;14;8" dur="2.8s" repeatCount="indefinite" begin="0.3s"/>
                      <animate attributeName="y" values="10;12;4;10" dur="2.8s" repeatCount="indefinite" begin="0.3s"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="18" y1="2" x2="18" y2="30" stroke="#ef4444" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="16" y="14" width="4" height="10" fill="url(#candleRed)" rx="1">
                      <animate attributeName="height" values="10;6;16;10" dur="3.2s" repeatCount="indefinite" begin="0.8s"/>
                      <animate attributeName="y" values="14;18;8;14" dur="3.2s" repeatCount="indefinite" begin="0.8s"/>
                    </rect>
                  </g>
                </svg>
              </div>

              {/* Bottom Left Corner */}
              <div className="absolute -bottom-1 -left-1 w-8 h-8 rotate-270">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <g>
                    <line x1="6" y1="4" x2="6" y2="28" stroke="#a855f7" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="4" y="12" width="4" height="8" fill="#a855f7" rx="1">
                      <animate attributeName="height" values="8;12;4;8" dur="2.7s" repeatCount="indefinite"/>
                      <animate attributeName="y" values="12;8;16;12" dur="2.7s" repeatCount="indefinite"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="12" y1="6" x2="12" y2="26" stroke="#ef4444" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="10" y="8" width="4" height="14" fill="url(#candleRed)" rx="1">
                      <animate attributeName="height" values="14;10;18;14" dur="3.8s" repeatCount="indefinite" begin="0.4s"/>
                      <animate attributeName="y" values="8;12;4;8" dur="3.8s" repeatCount="indefinite" begin="0.4s"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="18" y1="2" x2="18" y2="30" stroke="#22c55e" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="16" y="10" width="4" height="12" fill="url(#candleGreen)" rx="1">
                      <animate attributeName="height" values="12;8;16;12" dur="4.2s" repeatCount="indefinite" begin="1.2s"/>
                      <animate attributeName="y" values="10;14;6;10" dur="4.2s" repeatCount="indefinite" begin="1.2s"/>
                    </rect>
                  </g>
                </svg>
              </div>

              {/* Bottom Right Corner */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rotate-180">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <g>
                    <line x1="6" y1="4" x2="6" y2="28" stroke="#f59e0b" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="4" y="6" width="4" height="16" fill="#f59e0b" rx="1">
                      <animate attributeName="height" values="16;12;20;16" dur="3.3s" repeatCount="indefinite"/>
                      <animate attributeName="y" values="6;10;2;6" dur="3.3s" repeatCount="indefinite"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="12" y1="6" x2="12" y2="26" stroke="#22c55e" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="10" y="12" width="4" height="6" fill="url(#candleGreen)" rx="1">
                      <animate attributeName="height" values="6;10;4;6" dur="2.9s" repeatCount="indefinite" begin="0.6s"/>
                      <animate attributeName="y" values="12;8;14;12" dur="2.9s" repeatCount="indefinite" begin="0.6s"/>
                    </rect>
                  </g>
                  
                  <g>
                    <line x1="18" y1="2" x2="18" y2="30" stroke="#ef4444" strokeWidth="0.5" opacity="0.6"/>
                    <rect x="16" y="8" width="4" height="14" fill="url(#candleRed)" rx="1">
                      <animate attributeName="height" values="14;18;10;14" dur="3.6s" repeatCount="indefinite" begin="0.9s"/>
                      <animate attributeName="y" values="8;4;12;8" dur="3.6s" repeatCount="indefinite" begin="0.9s"/>
                    </rect>
                  </g>
                </svg>
              </div>

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