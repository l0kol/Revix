
import React, { useState, useCallback } from 'react';
import { UserProfile, WalletInfo } from '../types';
import { MOCK_USER_PROFILE, MOCK_WALLET_INFO, MOCK_API_DELAY } from '../constants';

interface PreFetchedChannelInfo {
  name: string;
  subscriberCount?: number;
  videoCount?: number;
}

interface AuthContextType {
  isAuthenticated: boolean; // Will mirror isWalletConnected
  userProfile: UserProfile | null;
  isWalletConnected: boolean;
  walletInfo: WalletInfo | null;
  isLoadingWallet: boolean;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  confirmAndVerifyChannel: () => Promise<boolean>; // Renamed from verifyChannelOwnership
  isChannelVerified: boolean;
  isLoadingVerification: boolean;
  preFetchedChannelInfo: PreFetchedChannelInfo | null; // New state
  isLoadingPreFetch: boolean; // New state
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isChannelVerified, setIsChannelVerified] = useState(false);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [preFetchedChannelInfo, setPreFetchedChannelInfo] = useState<PreFetchedChannelInfo | null>(null);
  const [isLoadingPreFetch, setIsLoadingPreFetch] = useState(false);

  const isAuthenticated = isWalletConnected;

  const logout = useCallback(async () => {
    setIsLoadingWallet(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    setUserProfile(null);
    setWalletInfo(null);
    setIsWalletConnected(false);
    setIsChannelVerified(false);
    setPreFetchedChannelInfo(null);
    setIsLoadingWallet(false);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsLoadingWallet(true);
    setPreFetchedChannelInfo(null); // Clear previous pre-fetched info
    setIsLoadingPreFetch(true);

    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY)); // Simulate wallet connection
    setWalletInfo(MOCK_WALLET_INFO);
    setIsWalletConnected(true);
    
    // Simulate fetching basic channel info
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY * 0.75)); 
    setPreFetchedChannelInfo({
      name: MOCK_USER_PROFILE.youtubeChannelName || "Mock Channel Name",
      subscriberCount: MOCK_USER_PROFILE.subscriberCount,
      videoCount: MOCK_USER_PROFILE.videoCount,
    });
    setIsLoadingPreFetch(false);
    setIsLoadingWallet(false);
  }, []);

  const disconnectWallet = useCallback(async () => {
    setIsLoadingWallet(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    setWalletInfo(null);
    setIsWalletConnected(false);
    setIsChannelVerified(false); 
    setUserProfile(null);
    setPreFetchedChannelInfo(null);
    setIsLoadingWallet(false);
  }, []);

  // Renamed from verifyChannelOwnership to reflect it confirms pre-fetched data
  const confirmAndVerifyChannel = useCallback(async () => {
    if (!isWalletConnected || !preFetchedChannelInfo) {
      console.error("Wallet not connected or no pre-fetched channel info to confirm.");
      return false;
    }
    setIsLoadingVerification(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY * 1.5)); // Simulate verification process
    
    // Use preFetchedChannelInfo to populate userProfile
    setUserProfile({
      ...MOCK_USER_PROFILE, // Base mock profile
      youtubeChannelName: preFetchedChannelInfo.name,
      subscriberCount: preFetchedChannelInfo.subscriberCount,
      videoCount: preFetchedChannelInfo.videoCount,
    }); 
    setIsChannelVerified(true);
    setIsLoadingVerification(false);
    // Optionally clear preFetchedChannelInfo after successful verification if it's no longer needed
    // setPreFetchedChannelInfo(null); 
    return true;
  }, [isWalletConnected, preFetchedChannelInfo]);

  const contextValue: AuthContextType = {
      isAuthenticated,
      userProfile,
      isWalletConnected,
      walletInfo,
      isLoadingWallet,
      logout,
      connectWallet,
      disconnectWallet,
      confirmAndVerifyChannel,
      isChannelVerified,
      isLoadingVerification,
      preFetchedChannelInfo,
      isLoadingPreFetch,
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
