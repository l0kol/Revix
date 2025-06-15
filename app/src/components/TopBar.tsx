

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import { ArrowLeftOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import WalletIcon from './WalletIcon';

interface TopBarProps {
  onVerifyChannel: () => void; // This prop might be less relevant if verification is only in App.tsx's main flow
}

const TopBar: React.FC<TopBarProps> = ({ onVerifyChannel }) => {
  const {
    isWalletConnected,
    walletInfo,
    isLoadingWallet,
    logout,
    connectWallet,
    // disconnectWallet, // Removed as logout handles full clear, or could be in a dropdown
    isChannelVerified,
    isLoadingVerification,
    preFetchedChannelInfo, // Access preFetchedChannelInfo to decide if "Verify" button should be active/shown
  } = useAuth();

  const getShortAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // The "Verify" button in TopBar should ideally only be active if preFetchedChannelInfo is present.
  // And `onVerifyChannel` is passed from App.tsx, which should be `handleConfirmChannelAndVerify`.
  const canAttemptVerification = isWalletConnected && !isChannelVerified && preFetchedChannelInfo;


  return (
    <header className="sticky top-0 z-30 bg-creator-secondary shadow-md h-16 flex items-center justify-end px-6 space-x-4">
      {isLoadingWallet ? ( 
        <Spinner size="md" />
      ) : (
        <>
          {!isWalletConnected ? ( 
            <button
              onClick={connectWallet}
              className="bg-protocol-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center drop-shadow-neon-blue hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]"
            >
              <WalletIcon className="h-5 w-5 mr-2" /> 
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="bg-creator-surface p-2 rounded-lg text-creator-text-secondary flex items-center text-xs">
                  <WalletIcon className="h-4 w-4 mr-1.5 text-protocol-blue" />
                  {walletInfo?.provider}: {getShortAddress(walletInfo?.address || '')}
                </div>
                {canAttemptVerification && ( // Only show verify button if conditions are met
                  <button
                    onClick={onVerifyChannel} // This calls `handleConfirmChannelAndVerify` from App.tsx
                    disabled={isLoadingVerification}
                    className="bg-protocol-blue hover:bg-blue-700 text-white font-semibold py-1.5 px-2.5 rounded-lg shadow-md transition duration-150 ease-in-out text-xs flex items-center justify-center"
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {isLoadingVerification ? <Spinner size="sm" color="text-white"/> : 'Confirm Channel'}
                  </button>
                )}
                {isChannelVerified && (
                  <span className="text-protocol-blue text-xs flex items-center p-1.5 bg-protocol-blue bg-opacity-10 rounded-md">
                    <ShieldCheckIcon className="h-4 w-4 mr-1.5 text-protocol-blue" /> Verified
                  </span>
                )}
              </div>
              <button
                onClick={logout} 
                className="text-creator-text-secondary hover:text-creator-primary font-semibold py-2 px-3 rounded-lg transition duration-150 ease-in-out flex items-center justify-center text-sm hover:bg-creator-surface"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          )}
        </>
      )}
    </header>
  );
};

export default TopBar;