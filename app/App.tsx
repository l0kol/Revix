import React, { useState, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import DashboardPage from "./components/DashboardPage";
import RemixesPage from "./components/RemixesPage";
import RevenuePage from "./components/RevenuePage";
import IPManagementPage from "./components/IPManagementPage";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import {
  ShieldCheckIcon,
  VideoCameraIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Spinner from "./components/Spinner";
import RevixLogo from "./components/RevixLogo";
import WalletIcon from "./components/WalletIcon";
import { ErrorBoundary } from "react-error-boundary";
import ConnectTomo from "./components/TomoConnect";
import { WagmiProvider } from "wagmi";
import {
  getDefaultConfig,
  TomoEVMKitProvider,
  Onboard,
} from "@tomo-inc/tomo-evm-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet } from "wagmi/chains";
const queryClient = new QueryClient();
import { GoogleOAuthProvider } from "@react-oauth/google";
import YouTubeAuthButton from "./components/YoutubeAuth";

import { ethers } from "ethers";

console.log("Loaded Tomo Client ID:", process.env.TOMO_CLIENT_ID);
console.log("Loaded Wallet project ID:", process.env.VITE_WALLET_CLOUD_KEY);

const config = getDefaultConfig({
  clientId: "", // from Tomo dashboard
  appName: "Revix",
  projectId: "", // from WalletConnect Cloud
  chains: [mainnet],
  ssr: false,
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" style={{ padding: "2rem", color: "red" }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

const AppContent: React.FC = () => {
  const {
    isAuthenticated, // This will mirror isWalletConnected
    isWalletConnected,
    verifyChannelOwnership,
    isLoadingVerification,
    isChannelVerified,
    userProfile, // Still used for display in verification prompt, but populated by verifyChannelOwnership
    walletInfo,
    isLoadingWallet,
    accessToken,
  } = useAuth();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );

  const handleVerifyChannel = useCallback(async () => {
    setVerificationMessage(null);
    if (!isWalletConnected) {
      // Check only wallet connection
      setVerificationMessage("Please connect your wallet first.");
      return;
    }
    const success = await verifyChannelOwnership();
    if (success) {
      setVerificationMessage("Channel ownership verified successfully!");
    } else {
      setVerificationMessage(
        "Channel ownership verification failed. Please try again."
      ); // Simplified message
    }
  }, [isWalletConnected, verifyChannelOwnership]);

  // isAuthenticated is true if isWalletConnected is true.
  // So, showMainContent can be simplified or rely on isChannelVerified too.
  const showMainContent = isWalletConnected && isChannelVerified;

  return (
    <div className="flex min-h-screen bg-creator-background dynamic-aurora-background">
      <Navbar />

      <div className="flex-1 flex flex-col ml-64">
        <TopBar />

        {verificationMessage && (
          <div
            className={`p-3 text-center text-sm sticky top-16 z-20 ${
              verificationMessage.includes("success")
                ? "bg-green-600"
                : "bg-red-600"
            } text-white`}
          >
            {verificationMessage}
            <button
              onClick={() => setVerificationMessage(null)}
              className="ml-4 text-white font-bold text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        <main
          className={`flex-grow p-6 md:p-10 ${
            verificationMessage ? "pt-0" : ""
          } relative z-0`}
        >
          {!isWalletConnected && ( // Changed from !isAuthenticated
            <div className="flex-grow flex flex-col items-center justify-center text-center mt-5 p-10 bg-gradient-to-br from-creator-background via-creator-secondary to-creator-background rounded-lg shadow-xl mt-[2rem]">
              <RevixLogo
                width={120}
                height={120}
                primaryColor="#FF0000"
                secondaryColor="#3B82F6"
                glowColor="#FF0000"
                glowOpacity={0.6}
                glowStdDeviation={3.5}
                className="mb-8 drop-shadow-neon-red"
              />
              <h1 className="text-5xl font-bold text-creator-text-primary mb-6 text-neon-red">
                Revix
              </h1>
              <p className="text-xl text-creator-text-secondary max-w-2xl mb-10 leading-relaxed">
                Secure your YouTube content as IP, track its journey with Story
                Protocol, and manage your earnings in the new creator economy.
              </p>
              <p className="text-md text-protocol-blue drop-shadow-neon-blue animate-pulse mb-6">
                Connect your You Tube channel with your on-chain identity.
              </p>

              <ConnectTomo />
              <div className="mt-8 flex space-x-8">
                <div className="flex flex-col items-center">
                  <VideoCameraIcon className="w-12 h-12 text-creator-primary mb-2 drop-shadow-neon-red" />
                  <p className="text-creator-text-secondary text-sm">
                    Monetize Content
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ShareIcon className="w-12 h-12 text-protocol-blue mb-2 drop-shadow-neon-blue" />
                  <p className="text-creator-text-secondary text-sm">
                    Track Remixes
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheckIcon className="w-12 h-12 text-green-500 mb-2 drop-shadow-[0_0_7px_rgba(34,197,94,0.7)]" />
                  <p className="text-creator-text-secondary text-sm">
                    Secure IP
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Block for (isAuthenticated && !isWalletConnected) is removed as it's redundant */}

          {isWalletConnected &&
            !isChannelVerified && ( // Changed from (isAuthenticated && isWalletConnected && !isChannelVerified)
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-creator-surface rounded-lg shadow-lg mt-[-4rem]">
                <ShieldCheckIcon className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-[0_0_7px_rgba(234,179,8,0.7)]" />
                <h2 className="text-2xl font-semibold text-creator-text-primary mb-3">
                  Verify YouTube Channel Ownership
                </h2>
                <p className="text-creator-text-secondary max-w-lg mb-6">
                  To ensure you're registering IP for your own content, please
                  verify your YouTube channel. This links your channel with your
                  wallet{" "}
                  {walletInfo?.accounts[0].address && (
                    <span className="font-mono text-sm">
                      {walletInfo.accounts[0].address.substring(0, 6)}...
                      {walletInfo.accounts[0].address.substring(
                        walletInfo.accounts[0].address.length - 4
                      )}
                    </span>
                  )}
                  .
                  {/* Removed mention of userProfile.email and Google account */}
                </p>
                <YouTubeAuthButton />
              </div>
            )}

          {showMainContent && (
            <Routes>
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ip-management" element={<IPManagementPage />} />
              <Route path="/remixes" element={<RemixesPage />} />
              <Route path="/revenue" element={<RevenuePage />} />
            </Routes>
          )}
        </main>
        <footer className="bg-creator-secondary text-center py-4 border-t border-gray-700 relative z-10">
          <p className="text-sm text-creator-text-secondary">
            &copy; {new Date().getFullYear()} Revix. All rights reserved (Demo
            Version).
          </p>
        </footer>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GoogleOAuthProvider clientId="">
        <AuthProvider>
          <HashRouter>
            <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
                <TomoEVMKitProvider>
                  <AppContent />
                </TomoEVMKitProvider>
              </QueryClientProvider>
            </WagmiProvider>
          </HashRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};
