
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RevixLogo from './RevixLogo';
import { Tab, NAV_TABS } from '../constants';
import { IdentificationIcon, VideoCameraIcon as SolidVideoCameraIcon } from '@heroicons/react/24/solid'; 

const Navbar: React.FC = () => {
  const {
    isWalletConnected, 
    isChannelVerified, 
    userProfile,       
    walletInfo,  
    logout, // Added logout      
  } = useAuth();

  const activeLinkClass = "bg-[#0f0f0f] text-creator-text-primary";
  const inactiveLinkClass = "text-gray-400 hover:bg-[#3e3e3e] hover:text-creator-text-primary";

  const showNavLinks = isWalletConnected; 
  const showChannelDetails = isWalletConnected && isChannelVerified && userProfile && walletInfo;


  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-creator-secondary shadow-xl flex flex-col p-4 transition-transform duration-300 ease-in-out">
      {/* Header - Made clickable */}
      <button
        onClick={logout}
        className="flex items-center mb-8 px-2 pt-2 text-left w-full hover:opacity-80 transition-opacity"
        aria-label="Go to homepage and logout"
      >
        <RevixLogo 
          width={36} 
          height={36} 
          glowColor="#FF0000" 
          glowStdDeviation={1.5}
        />
        <span 
          className="ml-2.5 font-bold text-xl text-creator-text-primary drop-shadow-neon-red"
        >
          Revix
        </span>
      </button>

      {/* Navigation Links */}
      {showNavLinks && (
        <nav className="flex-grow space-y-2"> 
          {NAV_TABS.map((tab: Tab) => (
            <NavLink
              key={tab.id}
              to={`/${tab.id}`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 group ${isActive ? activeLinkClass : inactiveLinkClass}`
              }
            >
              <tab.icon className={`w-5 h-5 mr-3`} />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
      
      {!showNavLinks && <div className="flex-grow"></div>}
      
      {/* Channel and Web3 ID Details Section - UPDATED */}
      {showChannelDetails && (
        <div className="mt-auto p-3 bg-creator-background rounded-lg  shadow-md">
          <div className="space-y-4">
            {/* Channel Section */}
            <div className="flex items-start">
              <SolidVideoCameraIcon className="w-5 h-5 mr-2.5 mt-0.5 text-creator-primary flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-creator-text-secondary uppercase tracking-wider mb-0.5">Channel</span>
                <span className="block text-sm font-semibold text-creator-text-primary truncate" title={userProfile.youtubeChannelName || 'N/A'}>
                  {userProfile.youtubeChannelName || 'N/A'}
                </span>
                <span className="block text-xs text-creator-text-secondary">
                  {userProfile.subscriberCount?.toLocaleString() || '0'} subs &bull; {userProfile.videoCount || '0'} videos
                </span>
              </div>
            </div>

            {/* Web3 ID Section */}
            <div className="flex items-start">
              <IdentificationIcon className="w-5 h-5 mr-2.5 mt-0.5 text-protocol-blue flex-shrink-0" />
              <div>
                <span className="block text-xs font-medium text-creator-text-secondary uppercase tracking-wider mb-0.5">Web3 ID</span>
                {walletInfo.ensName ? (
                  <>
                    <span className="block text-sm font-semibold text-creator-text-primary truncate" title={walletInfo.ensName}>
                      {walletInfo.ensName}
                    </span>
                    <span className="block text-xs text-creator-text-secondary font-mono">
                      ({walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(walletInfo.address.length - 4)})
                    </span>
                  </>
                ) : (
                  <span className="block text-sm font-semibold text-creator-text-primary font-mono truncate" title={walletInfo.address}>
                    {walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(walletInfo.address.length - 4)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Navbar;
