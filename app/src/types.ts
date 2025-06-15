

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  youtubeChannelId?: string;
  youtubeChannelName?: string; // Added
  subscriberCount?: number;    // Added
  videoCount?: number;         // Added
}

export interface WalletInfo {
  address: string;
  provider: string; // e.g., 'Privy', 'Tomo'
  ensName?: string; // Added
}

export enum VideoMonetizationStatus {
  MONETIZED = 'Monetized',
  NOT_MONETIZED = 'Not Monetized',
  LIMITED = 'Limited',
  UNKNOWN = 'Unknown',
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO 8601 string
  viewCount: number;
  likeCount: number;
  monetizationStatus: VideoMonetizationStatus;
  youtubeUrl: string;
  description: string;
}

export enum IPRegistrationStatus {
  REGISTERED = 'Registered',
  NOT_REGISTERED = 'Not Registered',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

export interface IPRegistration {
  videoId: string;
  status: IPRegistrationStatus;
  storyProtocolId?: string; // ID from Story Protocol
  registrationDate?: string; // ISO 8601 string
  transactionHash?: string;
  licenseType?: string; // Added for selected license
}

export type RemixStatus = 'new' | 'trending' | 'high-earner' | 'normal';

export interface Remix {
  id: string;
  originalIpId: string; // Story Protocol ID of the original IP
  remixVideoUrl: string;
  remixerWallet: string;
  remixDate: string; // ISO 8601 string
  title: string;
  // New fields for enhanced Remixes Page
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  earnings: number;
  status: RemixStatus;
  remixerAvatarUrl?: string; // Optional: URL for remixer's avatar
}

export interface RevenueData {
  youtubeRevenue: number;
  storyProtocolRoyalties: number;
}

export interface InvestorShare {
  investorAddress: string;
  sharePercentage: number;
  totalPaid: number;
}

export interface Tab {
  id: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}