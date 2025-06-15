
import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TopBar from './components/TopBar'; 
import LandingPageHeader from '@/components/LandingPageHeader';
import DashboardPage from './components/DashboardPage';
import RemixesPage from './components/RemixesPage';
import RevenuePage from './components/RevenuePage';
import IPManagementPage from './components/IPManagementPage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ShieldCheckIcon, VideoCameraIcon, ShareIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ComputerDesktopIcon, CursorArrowRaysIcon, PresentationChartLineIcon, ChevronDownIcon, LockClosedIcon, BanknotesIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline'; // Added LockClosedIcon, BanknotesIcon, ChartBarSquareIcon
import Spinner from './components/Spinner';
import RevixLogo from './components/RevixLogo';
import YouTubeIcon from '@/components/YouTubeIcon'; 

const AppContent: React.FC = () => {
  const { 
    isWalletConnected, 
    confirmAndVerifyChannel, 
    isLoadingVerification, 
    isChannelVerified, 
    walletInfo,
    connectWallet, 
    isLoadingWallet,
    preFetchedChannelInfo,
    isLoadingPreFetch,
    disconnectWallet,
  } = useAuth();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const handleConfirmChannelAndVerify = useCallback(async () => {
    setVerificationMessage(null);
    if (!isWalletConnected || !preFetchedChannelInfo) { 
      setVerificationMessage("Channel information not available for confirmation.");
      return;
    }
    const success = await confirmAndVerifyChannel();
    if (success) {
      setVerificationMessage("Channel ownership verified and linked successfully!");
    } else {
      setVerificationMessage("Channel ownership verification failed. Please try again.");
    }
  }, [isWalletConnected, preFetchedChannelInfo, confirmAndVerifyChannel]);
  
  const showMainContent = isWalletConnected && isChannelVerified;

  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen bg-creator-background dynamic-aurora-background">
      {showMainContent && <Navbar />}
      
      <div className={`flex-1 flex flex-col ${showMainContent ? 'ml-64' : ''}`}>
        {showMainContent ? (
          <TopBar onVerifyChannel={handleConfirmChannelAndVerify} />
        ) : (
          <LandingPageHeader onConnectWallet={connectWallet} isLoading={isLoadingWallet} />
        )}

        {verificationMessage && (
          <div className={`p-3 text-center text-sm sticky ${showMainContent ? 'top-16' : 'top-0'} z-20 ${verificationMessage.includes("success") ? 'bg-protocol-blue' : 'bg-red-600'} text-white`}>
            {verificationMessage}
            <button onClick={() => setVerificationMessage(null)} className="ml-4 text-white font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        <main className={`flex-grow ${showMainContent ? 'p-6 md:p-10' : 'pt-0 px-0'} ${verificationMessage ? 'pt-0' : ''} relative z-10`}> 
          
          {!isWalletConnected && (
             <div className="flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full flex flex-col items-center justify-center py-16 md:py-24 px-4 bg-creator-background relative overflow-hidden">
                    <div className="w-full max-w-4xl mx-auto text-center py-12 md:py-16 px-6 md:px-8 bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl relative animate-fadeInUp ring-1 ring-creator-text-secondary/30 shadow-[0_0_60px_theme(colors.creator-text-secondary/20)]">
                        <RevixLogo 
                            width={80} 
                            height={80} 
                            primaryColor="#fe002c" 
                            secondaryColor="#3B82F6" 
                            className="mx-auto mb-10"
                        />
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-creator-text-primary mb-5 leading-tight">
                            Protect Your Creativity. Own Your Impact.
                        </h1>
                        <p className="text-lg md:text-xl text-creator-text-secondary max-w-2xl mx-auto mb-10">
                            Secure your YouTube content as intellectual property, track its journey onchain with Story Protocol, and manage your earnings in the new creator economy.
                        </p>
                        <button
                            onClick={connectWallet}
                            disabled={isLoadingWallet}
                            className="bg-creator-primary hover:shadow-[0_0_20px_theme(colors.creator-primary/70)]
                                        text-white font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl
                                        transition-all duration-300 ease-in-out flex items-center justify-center text-lg mx-auto transform hover:scale-105"
                        >
                            {isLoadingWallet ? (
                                <Spinner size="sm" color="text-white" />
                            ) : (
                                <>
                                    <YouTubeIcon className="w-6 h-6 mr-2.5" />
                                    Connect your YouTube to a wallet
                                </>
                            )}
                        </button>
                    </div>
                    {/* Scroll Down Arrow & Text - Moved outside and below the panel */}
                    <div className="mt-12 text-center animate-bounce-scroll">
                        <button
                            onClick={scrollToHowItWorks}
                            aria-label="Scroll to how it works section"
                            className="p-2 rounded-full text-white/70 hover:text-white transition-all flex flex-col items-center group"
                        >
                            <ChevronDownIcon className="w-8 h-8 md:w-10 md:h-10 group-hover:text-white" />
                            <span className="mt-1 text-xs uppercase tracking-wider text-white/70 group-hover:text-white">Scroll</span>
                        </button>
                    </div>
                </section>

                {/* How Revix Works Section */}
                <section id="how-it-works-section" className="w-full bg-creator-background py-16 md:py-24 px-4">
                    <div className="w-full max-w-5xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-creator-text-primary mb-5">
                            How Revix Works
                        </h2>
                        <p className="text-md md:text-lg text-creator-text-secondary max-w-xl mx-auto mb-16">
                            Revix simplifies the process of protecting your YouTube content and tracking its usage.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature Card 1 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-protocol-blue/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-protocol-blue/20 mb-6 inline-block">
                                    <ComputerDesktopIcon className="w-10 h-10 text-protocol-blue" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Seamless YouTube Integration</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Connect your YouTube channel effortlessly and manage your video library within Revix.
                                </p>
                            </div>
                            {/* Feature Card 2 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-protocol-blue/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-protocol-blue/20 mb-6 inline-block">
                                    <CursorArrowRaysIcon className="w-10 h-10 text-protocol-blue" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Easy IP Registration</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Register your videos as intellectual property on-chain with three easy steps, ensuring ownership and protection.
                                </p>
                            </div>
                            {/* Feature Card 3 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-creator-primary/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-creator-primary/20 mb-6 inline-block">
                                    <PresentationChartLineIcon className="w-10 h-10 text-creator-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Visual Usage Tracking</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Track remixes and usage of your content visually, gaining insights into its reach and impact.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits for Creators Section - ADDED HERE */}
                <section className="w-full bg-creator-background py-16 md:py-24 px-4">
                    <div className="w-full max-w-5xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-creator-text-primary mb-5">
                            Benefits for Creators
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                            {/* Benefit Card 1 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-creator-primary/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-creator-primary/20 mb-6 inline-block">
                                    <LockClosedIcon className="w-10 h-10 text-creator-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Secure Your Content</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Proven, on-chain IP registration to safeguard your creative work.
                                </p>
                            </div>
                            {/* Benefit Card 2 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-protocol-blue/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-protocol-blue/20 mb-6 inline-block">
                                    <BanknotesIcon className="w-10 h-10 text-protocol-blue" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Unlock Financial Opportunities</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Leverage your verified IP assets for investments, revenue-sharing and staking.
                                </p>
                            </div>
                            {/* Benefit Card 3 */}
                            <div className="bg-creator-surface p-8 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-creator-primary/20 hover:scale-105">
                                <div className="p-5 rounded-full bg-creator-primary/20 mb-6 inline-block">
                                    <ChartBarSquareIcon className="w-10 h-10 text-creator-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-creator-text-primary mb-3">Empower Your Influence</h3>
                                <p className="text-sm text-creator-text-secondary">
                                    Clear insights into your content’s reach, remix and licenses journey, and economic impact.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

             </div>
          )}
          
          {isWalletConnected && !isChannelVerified && (
            <>
              {isLoadingPreFetch && (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-10 bg-creator-surface/80 backdrop-blur-md rounded-lg shadow-lg mt-[2rem] animate-fadeInUp">
                  <Spinner size="lg" />
                  <p className="text-creator-text-secondary mt-4 text-lg">Fetching channel information...</p>
                </div>
              )}

              {!isLoadingPreFetch && preFetchedChannelInfo && (
                <div className="flex-grow flex flex-col items-center justify-center text-center mt-5 p-10 bg-creator-surface/80 backdrop-blur-md rounded-lg shadow-lg mt-[2rem] animate-fadeInUp">
                  <ShieldCheckIcon className="w-16 h-16 text-protocol-blue mb-4 drop-shadow-neon-blue" />
                  <h2 className="text-2xl font-semibold text-creator-text-primary mb-3">Confirm Your YouTube Channel</h2>
                  <p className="text-creator-text-secondary max-w-lg mb-2">
                    Please confirm that this is the correct YouTube channel to associate with your wallet: <span className="font-mono text-protocol-blue">{walletInfo?.address && `${walletInfo.address.substring(0,6)}...${walletInfo.address.substring(walletInfo.address.length-4)}`}</span>
                  </p>

                  <div className="bg-creator-background/50 backdrop-blur-sm p-4 rounded-md mb-6 w-full max-w-md border border-red-700">
                    <div className="flex items-center justify-center mb-1">
                      <YouTubeIcon className="w-7 h-7 mr-2 text-creator-primary" />
                      <p className="text-2xl font-bold text-creator-text-primary">{preFetchedChannelInfo.name}</p>
                    </div>
                    {preFetchedChannelInfo.subscriberCount !== undefined && (
                        <p className="text-base text-creator-text-secondary">Subscribers: {preFetchedChannelInfo.subscriberCount.toLocaleString()}</p>
                    )}
                    {preFetchedChannelInfo.videoCount !== undefined && (
                        <p className="text-base text-creator-text-secondary">Videos: {preFetchedChannelInfo.videoCount.toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConfirmChannelAndVerify}
                      disabled={isLoadingVerification}
                      className="bg-protocol-blue hover:bg-blue-700 text-creator-text-primary font-semibold py-2.5 px-5 rounded-lg shadow-lg transition-all duration-150 ease-in-out flex items-center text-base hover:scale-105 border border-protocol-blue"
                    >
                      {isLoadingVerification ? <Spinner size="sm" color="text-creator-text-primary"/> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
                      Yes, Confirm & Link
                    </button>
                    <button
                      onClick={disconnectWallet}
                      disabled={isLoadingVerification}
                      className="bg-transparent hover:bg-protocol-blue/10 text-protocol-blue font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-150 ease-in-out flex items-center text-base hover:scale-105 border border-protocol-blue"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      No, Wrong Channel
                    </button>
                  </div>
                </div>
              )}
              {!isLoadingPreFetch && !preFetchedChannelInfo && !isLoadingWallet && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-creator-surface/80 backdrop-blur-md rounded-lg shadow-lg mt-[-4rem] animate-fadeInUp">
                  <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                  <h2 className="text-2xl font-semibold text-creator-text-primary mb-3">Channel Not Detected</h2>
                  <p className="text-creator-text-secondary max-w-lg mb-6">
                    We could not automatically detect your YouTube channel information. Please ensure your wallet is associated with an account that has a YouTube channel or try reconnecting.
                  </p>
                  <button
                      onClick={disconnectWallet}
                      className="bg-gray-500/80 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-150 ease-in-out flex items-center text-lg backdrop-blur-sm border border-gray-600 hover:border-gray-500"
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Try Reconnecting Wallet
                  </button>
                 </div>
              )}
            </>
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
        <footer className={`bg-creator-secondary/80 backdrop-blur-sm text-center py-4 border-t border-gray-700/50 relative z-10 ${!showMainContent ? 'mt-auto' : ''}`}>
          <p className="text-sm text-creator-text-secondary">&copy; {new Date().getFullYear()} Revix. All rights reserved (Demo Version).</p>
        </footer>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};
