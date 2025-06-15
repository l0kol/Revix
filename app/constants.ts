import {
  Video,
  VideoMonetizationStatus,
  IPRegistrationStatus,
  Remix,
  RevenueData,
  InvestorShare,
  UserProfile,
  WalletInfo,
} from "./types"; // Added UserProfile, WalletInfo here
import {
  HomeIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  ShareIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Export Tab interface
export interface Tab {
  id: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

export const MOCK_API_DELAY = 1000; // ms

export const MOCK_USER_PROFILE: UserProfile = {
  // Explicitly type MOCK_USER_PROFILE
  id: "user123",
  name: "Creative Creator",
  email: "creator@example.com",
  avatarUrl: "https://picsum.photos/seed/user123/100/100",
  youtubeChannelId: "UC123channel",
  youtubeChannelName: "My Awesome Channel", // Added
  subscriberCount: 251947, // Added
  videoCount: 283, // Added
};

export const MOCK_WALLET_INFO: WalletInfo = {
  // Explicitly type MOCK_WALLET_INFO
  accounts: "0xe502d0f8bf3db02fbf765656ebea77bb13916b2a",
  provider: "Privy",
  ensName: "0xMyAwesom.eth", // Added
};

export const MOCK_VIDEOS: Video[] = [
  {
    id: "vid001",
    title: "My Awesome Adventure Vlog",
    thumbnailUrl: "https://picsum.photos/seed/vid001/480/270",
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    viewCount: 150320,
    likeCount: 8700,
    monetizationStatus: VideoMonetizationStatus.MONETIZED,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description:
      "Join me on an epic adventure! This vlog captures the highlights of my recent trip. #adventure #travel #vlog",
  },
  {
    id: "vid002",
    title: "Ultimate Gaming Montage",
    thumbnailUrl: "https://picsum.photos/seed/vid002/480/270",
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    viewCount: 75000,
    likeCount: 4200,
    monetizationStatus: VideoMonetizationStatus.NOT_MONETIZED,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description:
      "Check out these insane gaming moments! Years of practice led to this. #gaming #montage #esports",
  },
  {
    id: "vid003",
    title: "Cooking Masterclass: Perfect Pasta",
    thumbnailUrl: "https://picsum.photos/seed/vid003/480/270",
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    viewCount: 250000,
    likeCount: 12000,
    monetizationStatus: VideoMonetizationStatus.MONETIZED,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description:
      "Learn how to make the perfect pasta dish from scratch. Easy to follow recipe for delicious results. #cooking #recipe #pasta #foodie",
  },
  {
    id: "vid004",
    title: "Understanding Web3: A Beginner's Guide",
    thumbnailUrl: "https://picsum.photos/seed/vid004/480/270",
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    viewCount: 5000,
    likeCount: 300,
    monetizationStatus: VideoMonetizationStatus.LIMITED,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description:
      "Demystifying Web3, blockchain, and crypto. This guide is for absolute beginners. #web3 #blockchain #crypto #tutorial",
  },
];

export const INITIAL_IP_REGISTRATIONS: Record<string, IPRegistrationStatus> = {
  vid001: IPRegistrationStatus.REGISTERED,
  vid002: IPRegistrationStatus.NOT_REGISTERED,
  vid003: IPRegistrationStatus.REGISTERED,
  vid004: IPRegistrationStatus.NOT_REGISTERED,
};

export const MOCK_REMIXES: Record<string, Remix[]> = {
  vid001_story_id: [
    {
      id: "remix001",
      originalIpId: "vid001_story_id",
      remixVideoUrl: "https://youtube.com/remix1",
      remixerWallet: "0xabc...",
      remixDate: new Date().toISOString(),
      title: "Cool Remix of Adventure",
    },
    {
      id: "remix002",
      originalIpId: "vid001_story_id",
      remixVideoUrl: "https://youtube.com/remix2",
      remixerWallet: "0xdef...",
      remixDate: new Date().toISOString(),
      title: "Another Take on Adventure",
    },
  ],
  vid003_story_id: [
    {
      id: "remix003",
      originalIpId: "vid003_story_id",
      remixVideoUrl: "https://youtube.com/remix3",
      remixerWallet: "0xghi...",
      remixDate: new Date().toISOString(),
      title: "Pasta Remix - Spicy Version",
    },
  ],
};

export const MOCK_REVENUE_DATA: RevenueData = {
  youtubeRevenue: 1250.75,
  storyProtocolRoyalties: 350.2,
};

export const MOCK_INVESTOR_SHARES: InvestorShare[] = [
  { investorAddress: "0xInvestor1...", sharePercentage: 10, totalPaid: 125.08 },
  { investorAddress: "0xInvestor2...", sharePercentage: 5, totalPaid: 62.54 },
];

// Export NAV_TABS
export const NAV_TABS: Tab[] = [
  // Explicitly type NAV_TABS
  { id: "dashboard", label: "My Videos", icon: VideoCameraIcon },
  { id: "ip-management", label: "IP Management", icon: ShieldCheckIcon },
  { id: "remixes", label: "Remixes", icon: ShareIcon },
  { id: "revenue", label: "Revenue", icon: CurrencyDollarIcon },
];
