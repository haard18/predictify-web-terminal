export interface Market {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  endDate: string;
  probability: number;
  isWatched?: boolean;
  image?: string;
  icon?: string;
  active?: boolean;
  closed?: boolean;
  outcomes?: string[];
  slug?: string;
  tags?: string[];
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  views: number;
  shares: number;
  marketIds: string[];
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Trader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  totalTrades: number;
  followers: number;
  roi: number;
  isFollowed?: boolean;
}

export interface Position {
  id: string;
  marketId: string;
  marketName: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  winRate: number;
  roi: number;
  totalTrades: number;
  subscribers: number;
  performance: number[];
  isSubscribed?: boolean;
  category: string;
}
