
import React from 'react';
import { Remix } from '../types';
import { EyeIcon, HeartIcon, CurrencyDollarIcon, PlayCircleIcon, LinkIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import WalletIcon from './WalletIcon'; // Assuming WalletIcon is generic enough

interface RemixCardProps {
  remix: Remix;
}

const RemixCard: React.FC<RemixCardProps> = ({ remix }) => {
  const {
    title,
    thumbnailUrl,
    remixerWallet,
    remixDate,
    viewCount,
    likeCount,
    earnings,
    status,
    remixVideoUrl,
    remixerAvatarUrl,
    originalIpId, // Ensure this is part of the Remix type and destructured
  } = remix;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  
  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusBadgeColor = (status: Remix['status']) => {
    switch (status) {
      case 'new': return 'bg-sky-500 text-sky-50';
      case 'trending': return 'bg-protocol-blue text-white'; // Changed from purple
      case 'high-earner': return 'bg-green-500 text-green-50';
      default: return 'bg-gray-500 text-gray-50';
    }
  };

  const storyProtocolExplorerBaseUrl = 'https://explorer.storyprotocol.xyz/ipa';

  return (
    <div className="bg-creator-surface rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={thumbnailUrl || 'https://via.placeholder.com/320x180?text=No+Thumbnail'} alt={title} />
        <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(status)} shadow`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-creator-text-primary mb-2 truncate" title={title}>
          {title || 'Untitled Remix'}
        </h3>

        <div className="flex items-center text-xs text-creator-text-secondary mb-3">
          {remixerAvatarUrl ? (
            <img src={remixerAvatarUrl} alt="Remixer" className="w-6 h-6 rounded-full mr-2 object-cover" />
          ) : (
            <UserCircleIcon className="w-6 h-6 mr-2 text-gray-500" />
          )}
          <span className="truncate" title={remixerWallet}>{remixerWallet.substring(0, 6)}...{remixerWallet.substring(remixerWallet.length - 4)}</span>
          <span className="mx-1.5">&#8226;</span>
          <span>{formatDate(remixDate)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="flex items-center text-creator-text-secondary" title="Views">
            <EyeIcon className="w-4 h-4 mr-1.5 text-sky-400" />
            <span>{formatStat(viewCount)}</span>
          </div>
          <div className="flex items-center text-creator-text-secondary" title="Likes">
            <HeartIcon className="w-4 h-4 mr-1.5 text-red-400" />
            <span>{formatStat(likeCount)}</span>
          </div>
          <div className="flex items-center text-creator-text-secondary" title="Earnings">
            <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-green-400" />
            <span>${earnings.toFixed(2)} Last month</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-2">
          <a
            href={remixVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center bg-creator-primary hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
          >
            <PlayCircleIcon className="w-5 h-5 mr-2" />
            View Remix
          </a>
          <div className="grid grid-cols-2 gap-2">
             <a
              href={`${storyProtocolExplorerBaseUrl}/${originalIpId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-creator-text-primary font-medium py-2 px-3 rounded-md text-sm transition-colors"
              title="View original IP on Story Protocol Explorer"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              View on Story
            </a>
            <a
              href={`mailto:contact.remixer.placeholder@example.com?subject=Regarding your remix: ${encodeURIComponent(title)}`}
              className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-creator-text-primary font-medium py-2 px-3 rounded-md text-sm transition-colors"
              title="Contact the owner of the YouTube channel that made this remix (mock action)"
            >
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />
              Contact Remixer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemixCard;