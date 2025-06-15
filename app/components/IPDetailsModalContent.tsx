import React from 'react';
import { Video, IPRegistration, Remix } from '../types';
import { LinkIcon, ShareIcon, CurrencyDollarIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'; // Added Cog6ToothIcon
import { Link as RouterLink } from 'react-router-dom';
import { MOCK_REMIXES } from '../constants'; // Import MOCK_REMIXES

interface IPDetailsModalContentProps {
  video: Video;
  ipRegistration: IPRegistration;
  onClose: () => void;
}

// License type mapping (similar to RegisterModalContent for display consistency)
const LICENSE_TYPE_MAP: Record<string, string> = {
  'NC-REMIX': 'Non-Commercial Social Remixing',
  'COMMERCIAL-REMIX': 'Commercial Remix',
  'COMMERCIAL-USE': 'Commercial Use (No Derivatives)',
  'CC-BY': 'Creative Commons Attribution (CC BY)',
};

const IPDetailsModalContent: React.FC<IPDetailsModalContentProps> = ({ video, ipRegistration, onClose }) => {
  const storyProtocolExplorerBaseUrl = 'https://explorer.storyprotocol.xyz/ipa'; // Example base URL
  const ipRemixes: Remix[] = ipRegistration.storyProtocolId ? MOCK_REMIXES[ipRegistration.storyProtocolId] || [] : [];
  const hasRemixes = ipRemixes.length > 0;
  const mockRevenue = ipRegistration.storyProtocolId ? (ipRegistration.storyProtocolId.includes('vid001') ? 75.50 : 30.25) : 0; // Simple mock revenue
  const licenseFriendlyName = ipRegistration.licenseType ? LICENSE_TYPE_MAP[ipRegistration.licenseType] || ipRegistration.licenseType : 'Not Specified';

  return (
    <div>
      <div className="bg-creator-surface p-4 rounded-md mb-6 space-y-3">
        <div>
            <h4 className="font-semibold text-lg text-creator-text-primary mb-1">{video.title}</h4>
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto rounded-md object-cover max-h-48 mb-2" />
        </div>
        
        <p className="text-sm text-creator-text-secondary">
          <strong>Status:</strong> <span className="text-green-400 font-medium">{ipRegistration.status}</span>
        </p>
        {ipRegistration.storyProtocolId && (
          <p className="text-sm text-creator-text-secondary">
            <strong>Story Protocol ID:</strong> {ipRegistration.storyProtocolId}
          </p>
        )}
        {ipRegistration.registrationDate && (
          <p className="text-sm text-creator-text-secondary">
            <strong>Registration Date:</strong> {new Date(ipRegistration.registrationDate).toLocaleString()}
          </p>
        )}
        {ipRegistration.transactionHash && (
          <p className="text-sm text-creator-text-secondary">
            <strong>Transaction Hash:</strong> {ipRegistration.transactionHash.substring(0,10)}...{ipRegistration.transactionHash.substring(ipRegistration.transactionHash.length-8)}
          </p>
        )}

        {/* License Type Display */}
        {ipRegistration.status === 'Registered' && ipRegistration.licenseType && (
            <div className="pt-1">
                <div className="flex items-center text-sm text-creator-text-secondary">
                    <DocumentTextIcon className="w-4 h-4 mr-1.5 text-protocol-blue"/>
                    <strong>License Type:</strong> 
                    <span className="ml-2 font-medium text-creator-text-primary">{licenseFriendlyName}</span>
                </div>
            </div>
        )}

        {/* View on Story Protocol Link */}
        {ipRegistration.storyProtocolId && (
            <div className="pt-2">
                <a
                href={`${storyProtocolExplorerBaseUrl}/${ipRegistration.storyProtocolId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-protocol-blue hover:text-blue-400 hover:underline transition-colors"
                >
                <LinkIcon className="w-4 h-4 mr-1.5" />
                View IP on Story Protocol
                </a>
            </div>
        )}

        {/* Remix Information */}
        {ipRegistration.storyProtocolId && (
            <div className="pt-1">
                <div className="flex items-center text-sm text-creator-text-secondary mb-1">
                    <ShareIcon className="w-4 h-4 mr-1.5 text-protocol-blue"/>
                    <strong>Remixes:</strong>
                    <span className={`ml-2 font-medium ${hasRemixes ? 'text-green-400' : 'text-gray-400'}`}>
                        {hasRemixes ? `${ipRemixes.length} Found` : 'No remixes found'}
                    </span>
                </div>
                {hasRemixes && (
                <RouterLink
                    to={`/remixes?ipId=${ipRegistration.storyProtocolId}`}
                    className="inline-flex items-center text-sm text-protocol-blue hover:text-blue-400 hover:underline transition-colors ml-5"
                >
                    Track Remixes
                </RouterLink>
                )}
            </div>
        )}
        
        {/* Revenue Generated */}
         {ipRegistration.status === 'Registered' && (
            <div className="pt-1">
                <div className="flex items-center text-sm text-creator-text-secondary">
                    <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-green-500"/>
                    <strong>Revenue Generated (from IP):</strong> 
                    <span className="ml-2 font-medium text-green-400">${mockRevenue.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 ml-1">(Mock)</span>
                </div>
            </div>
        )}

      </div>
      <div className="flex justify-end space-x-3">
        {ipRegistration.storyProtocolId && (
          <RouterLink
            to={`/ip-management?ipId=${ipRegistration.storyProtocolId}`}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors text-sm"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Manage my IP
          </RouterLink>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-protocol-blue hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default IPDetailsModalContent;