
import { Video, VideoMonetizationStatus, IPRegistrationStatus, Remix, RevenueData, InvestorShare, UserProfile, WalletInfo, RemixStatus } from './types'; // Added UserProfile, WalletInfo, RemixStatus here
import { HomeIcon, VideoCameraIcon, CurrencyDollarIcon, ShareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// Export Tab interface
export interface Tab {
  id: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

export const MOCK_API_DELAY = 1000; // ms

export const MOCK_USER_PROFILE: UserProfile = { // Explicitly type MOCK_USER_PROFILE
  id: 'user123',
  name: 'Creative Creator',
  email: 'creator@example.com',
  avatarUrl: 'https://picsum.photos/seed/user123/100/100',
  youtubeChannelId: 'UC123channel',
  youtubeChannelName: 'My Awesome Channel', // Added
  subscriberCount: 251947,              // Added
  videoCount: 283,                       // Added
};

export const MOCK_WALLET_INFO: WalletInfo = { // Explicitly type MOCK_WALLET_INFO
  address: '0xe502d0f8bf3db02fbf765656ebea77bb13916b2a',
  provider: 'Privy',
  ensName: '0xMyAwesom.eth', // Added
};

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'vid001',
    title: 'My Awesome Adventure Vlog',
    thumbnailUrl: 'https://picsum.photos/seed/vid001/480/270',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    viewCount: 150320,
    likeCount: 8700,
    monetizationStatus: VideoMonetizationStatus.MONETIZED,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Join me on an epic adventure! This vlog captures the highlights of my recent trip. #adventure #travel #vlog',
  },
  {
    id: 'vid002',
    title: 'Ultimate Gaming Montage',
    thumbnailUrl: 'https://picsum.photos/seed/vid002/480/270',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    viewCount: 75000,
    likeCount: 4200,
    monetizationStatus: VideoMonetizationStatus.NOT_MONETIZED,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Check out these insane gaming moments! Years of practice led to this. #gaming #montage #esports',
  },
  {
    id: 'vid003',
    title: 'Cooking Masterclass: Perfect Pasta',
    thumbnailUrl: 'https://picsum.photos/seed/vid003/480/270',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    viewCount: 250000,
    likeCount: 12000,
    monetizationStatus: VideoMonetizationStatus.MONETIZED,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Learn how to make the perfect pasta dish from scratch. Easy to follow recipe for delicious results. #cooking #recipe #pasta #foodie',
  },
   {
    id: 'vid004',
    title: 'Understanding Web3: A Beginner\'s Guide',
    thumbnailUrl: 'https://picsum.photos/seed/vid004/480/270',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    viewCount: 5000,
    likeCount: 300,
    monetizationStatus: VideoMonetizationStatus.LIMITED,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Demystifying Web3, blockchain, and crypto. This guide is for absolute beginners. #web3 #blockchain #crypto #tutorial',
  },
];

export const INITIAL_IP_REGISTRATIONS: Record<string, IPRegistrationStatus> = {
  'vid001': IPRegistrationStatus.REGISTERED,
  'vid002': IPRegistrationStatus.NOT_REGISTERED,
  'vid003': IPRegistrationStatus.REGISTERED,
  'vid004': IPRegistrationStatus.NOT_REGISTERED,
};

const generateRemixData = (originalIpId: string, titlePrefix: string, count: number, dateSeedDaysAgo: number): Remix[] => {
  const remixes: Remix[] = [];
  const statuses: RemixStatus[] = ['new', 'trending', 'high-earner', 'normal'];
  for (let i = 1; i <= count; i++) {
    const randomDaysAgo = dateSeedDaysAgo + Math.floor(Math.random() * 30 * (i % 6 + 1)); // Spread dates over a few months
    const viewCount = Math.floor(Math.random() * 150000) + 500;
    const likeCount = Math.floor(viewCount * (Math.random() * 0.1 + 0.03)); // Likes proportional to views
    const earnings = parseFloat((viewCount * (Math.random() * 0.001 + 0.0001) + Math.random() * 20).toFixed(2));
    let status: RemixStatus = statuses[Math.floor(Math.random() * statuses.length)];
    if (viewCount > 100000) status = 'trending';
    if (earnings > 75) status = 'high-earner';
    if (randomDaysAgo < 10) status = 'new';


    remixes.push({
      id: `remix${originalIpId.slice(0,6)}${i.toString().padStart(3, '0')}`,
      originalIpId,
      remixVideoUrl: `https://www.youtube.com/watch?v=remix${i}`,
      remixerWallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2,6)}`,
      remixDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * randomDaysAgo).toISOString(),
      title: `${titlePrefix} - Part ${i}${i % 3 === 0 ? ' (Official Fan Cut)' : ''}`,
      thumbnailUrl: `https://picsum.photos/seed/${originalIpId}_remix${i}/320/180`,
      viewCount,
      likeCount,
      earnings,
      status,
      remixerAvatarUrl: Math.random() > 0.3 ? `https://picsum.photos/seed/remixer${i}/40/40` : undefined,
    });
  }
  return remixes;
};


export const MOCK_REMIXES: Record<string, Remix[]> = {
  'vid001_story_id': generateRemixData('vid001_story_id', 'Adventure Remix', 5, 5),
  'vid003_story_id': generateRemixData('vid003_story_id', 'Pasta Delight Remix', 8, 10),
  // Add more mock remixes for other potential story IDs if needed
  // Example for an IP that might exist but has no remixes in mock data:
  'vid00X_story_id_no_remixes': [] 
};


export const MOCK_REVENUE_DATA: RevenueData = {
  youtubeRevenue: 1250.75,
  storyProtocolRoyalties: 350.20,
};

export const MOCK_INVESTOR_SHARES: InvestorShare[] = [
  { investorAddress: '0xInvestor1...', sharePercentage: 10, totalPaid: 125.08 },
  { investorAddress: '0xInvestor2...', sharePercentage: 5, totalPaid: 62.54 },
];

// Export NAV_TABS
export const NAV_TABS: Tab[] = [ // Explicitly type NAV_TABS
  { id: 'dashboard', label: 'My Videos', icon: VideoCameraIcon },
  { id: 'ip-management', label: 'IP Management', icon: ShieldCheckIcon },
  { id: 'remixes', label: 'Remixes', icon: ShareIcon },
  { id: 'revenue', label: 'Revenue', icon: CurrencyDollarIcon },
];
