import React from "react";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";
import {
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import WalletIcon from "./WalletIcon";

interface TopBarProps {
  onVerifyChannel: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onVerifyChannel }) => {
  const {
    isAuthenticated, // Mirrors isWalletConnected
    isWalletConnected,
    walletInfo,
    isLoadingWallet,
    logout,
    connectWallet,
    disconnectWallet, // Kept for clarity, though logout handles full clear
    isChannelVerified,
    isLoadingVerification,
  } = useAuth();

  const getShortAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <header className="sticky top-0 z-30 bg-creator-secondary shadow-md h-16 flex items-center justify-end px-6 space-x-4">
      {isLoadingWallet || isLoadingVerification ? ( // isLoadingAuth removed
        <Spinner size="md" />
      ) : (
        <>
          {!isWalletConnected ? ( // Changed from !isAuthenticated
            <button
              onClick={connectWallet} // Changed from loginWithGoogle
              className="bg-protocol-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center drop-shadow-neon-blue hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]"
            >
              <WalletIcon className="h-5 w-5 mr-2" />
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                {/* Wallet Info Display - This part remains mostly the same as it depends on isWalletConnected */}
                <div className="bg-creator-surface p-2 rounded-lg text-creator-text-secondary flex items-center text-xs">
                  <WalletIcon className="h-4 w-4 mr-1.5 text-green-500" />
                  {walletInfo?.label}:{" "}
                  {getShortAddress(walletInfo?.accounts[0].address || "")}
                </div>
                {!isChannelVerified && (
                  <button
                    onClick={onVerifyChannel}
                    disabled={isLoadingVerification}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-2.5 rounded-lg shadow-md transition duration-150 ease-in-out text-xs flex items-center justify-center"
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    Verify
                  </button>
                )}
                {isChannelVerified && (
                  <span className="text-green-400 text-xs flex items-center p-1.5 bg-green-500 bg-opacity-10 rounded-md">
                    <ShieldCheckIcon className="h-4 w-4 mr-1.5" /> Verified
                  </span>
                )}
                {/* disconnectWallet button can be part of a dropdown or less prominent if logout handles it */}
                {/* <button
                  onClick={disconnectWallet}
                  className="text-creator-text-secondary hover:text-creator-primary font-semibold py-1.5 px-2.5 rounded-lg transition duration-150 ease-in-out text-xs hover:bg-creator-surface"
                >
                  Disconnect
                </button> */}
              </div>
              <button
                onClick={logout} // Logout now handles full clearing including wallet
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
