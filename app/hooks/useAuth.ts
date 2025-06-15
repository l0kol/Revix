import React, { useState, useCallback } from "react";
import { UserProfile, WalletInfo } from "../types";
import {
  MOCK_USER_PROFILE,
  MOCK_WALLET_INFO,
  MOCK_API_DELAY,
} from "../constants";

interface AuthContextType {
  isAuthenticated: boolean; // Will mirror isWalletConnected
  userProfile: UserProfile | null;
  isWalletConnected: boolean;
  walletInfo: WalletInfo | null;
  isLoadingWallet: boolean;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  verifyChannelOwnership: () => Promise<boolean>;
  setUserProfile?: (profile: UserProfile | null) => void; // Optional setter for user profile
  isChannelVerified: boolean;
  isLoadingVerification: boolean;
  accessToken?: string; // Optional access token for YouTube API
  setAccessToken?: (token: string) => void; // Optional setter for access token
}

import { Onboard } from "@tomo-inc/tomo-evm-kit";
import injectedModule from "@web3-onboard/injected-wallets";
const injected = injectedModule();

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // isAuthenticated is now derived from isWalletConnected
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isChannelVerified, setIsChannelVerified] = useState(false);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);

  const isAuthenticated = isWalletConnected; // isAuthenticated directly reflects wallet connection status

  const logout = useCallback(async () => {
    setIsLoadingWallet(true); // Reuse isLoadingWallet for logout process
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    setUserProfile(null);
    setWalletInfo(null);
    setIsWalletConnected(false);
    setIsChannelVerified(false);
    setIsLoadingWallet(false);
  }, []);

  const [accessToken, setAccessToken] = useState<string | undefined>();

  const connectWallet = useCallback(async () => {
    const chains = [
      {
        id: 1, // Ethereum Mainnet
        token: "ETH",
        label: "Ethereum",
        rpcUrl: "https://cloudflare-eth.com",
      },
    ];

    setIsLoadingWallet(true);
    const onboard = await Onboard({
      wallets: [injected], // Use injected wallets
      chains,
      appMetadata: {
        name: "Revix",
      },
      theme: "light",
      clientId:
        "AUv2bM7FBMQLoqGitHkzP5enm969RYZ9Gxg52OpyJUbd9HdltoYIbZMmXO0mkkcbpMe9Rpvy9NKWPD15vY2k5YGC",
      projectId: "ad9c6fc572ad4fa01c9c5ef5ad3bdec0", // From WalletConnect Cloud
    });

    const wallets = await onboard.connectWallet();
    const wallet = wallets[0];
    console.log("Connected wallet:", wallet);
    console.log("Wallets:", wallet.accounts[0].address.substring(0, 6));
    setWalletInfo(wallet);
    setIsWalletConnected(true);
    // UserProfile is NOT set here, but on channel verification
    setIsLoadingWallet(false);
  }, []);

  const disconnectWallet = useCallback(async () => {
    // This is effectively what logout will do now for wallet part
    setIsLoadingWallet(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    setWalletInfo(null);
    setIsWalletConnected(false);
    setIsChannelVerified(false);
    setUserProfile(null); // Ensure user profile is cleared too
    setIsLoadingWallet(false);
  }, []);

  const verifyChannelOwnership = useCallback(async () => {
    if (!isWalletConnected) {
      console.error("Wallet not connected for verification.");
      return false;
    }

    if (!accessToken) {
      console.error("No access token available");
      return false;
    }

    setIsLoadingVerification(true);

    try {
      // Step 1: Get Google profile info
      console.log("Fetching Google profile with token:", accessToken);
      const profileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch Google profile");
      }

      const profileData = await profileResponse.json();

      // Step 2: Get YouTube channel info
      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error("Failed to fetch YouTube channel data");
      }

      const channelData = await channelResponse.json();
      const channel = channelData.items[0];
      console.log("YouTube channel data:", channel);

      // Step 3: Update user profile with all data
      setUserProfile({
        token: accessToken,
        name: profileData.name || "YouTube User",
        email: profileData.email,
        avatarUrl: profileData.picture,
        youtubeChannelId: channel.id,
        youtubeChannelName: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
      });

      console.log("User profile updated:", {
        token: accessToken,
        name: profileData.name || "YouTube User",
        email: profileData.email,
        avatarUrl: profileData.picture,
        youtubeChannelId: channel.id,
        youtubeChannelName: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
      });

      setIsChannelVerified(true);
      return true;
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    } finally {
      setIsLoadingVerification(false);
    }
  }, [isWalletConnected, accessToken, setUserProfile]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    userProfile,
    isWalletConnected,
    walletInfo,
    isLoadingWallet, // isLoadingAuth removed
    logout, // loginWithGoogle removed
    connectWallet,
    disconnectWallet,
    verifyChannelOwnership,
    isChannelVerified,
    isLoadingVerification,
    accessToken,
    setAccessToken, // Optional setter for access token
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
