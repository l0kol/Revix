import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RevixLogo from "./RevixLogo";
import { Tab, NAV_TABS } from "../constants";
import {
  IdentificationIcon,
  VideoCameraIcon as SolidVideoCameraIcon,
} from "@heroicons/react/24/solid";

const Navbar: React.FC = () => {
  const {
    isWalletConnected, // Changed from isAuthenticated
    isChannelVerified,
    userProfile,
    walletInfo,
  } = useAuth();

  const activeLinkClass = "bg-creator-primary text-white drop-shadow-neon-red";
  const inactiveLinkClass =
    "text-creator-text-secondary hover:bg-creator-surface hover:text-creator-text-primary";

  // Navigation links shown if wallet is connected. Specific features might be further restricted by channel verification inside pages.
  const showNavLinks = isWalletConnected;
  // Channel details shown if wallet connected, channel verified, and profiles exist
  const showChannelDetails =
    isWalletConnected && isChannelVerified && userProfile && walletInfo;

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-creator-secondary shadow-xl flex flex-col p-4 transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center mb-8 px-2 pt-2">
        <RevixLogo
          width={36}
          height={36}
          glowColor="#FF0000"
          glowStdDeviation={1.5}
        />
        <span className="ml-2.5 font-bold text-xl text-creator-text-primary drop-shadow-neon-red">
          Revix
        </span>
      </div>

      {/* Navigation Links */}
      {showNavLinks && (
        <nav className="flex-grow space-y-2">
          {NAV_TABS.map((tab: Tab) => (
            <NavLink
              key={tab.id}
              to={`/${tab.id}`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 group ${
                  isActive ? activeLinkClass : inactiveLinkClass
                }`
              }
            >
              <tab.icon className={`w-5 h-5 mr-3`} />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}

      {!showNavLinks && <div className="flex-grow"></div>}

      {/* Channel and Web3 ID Details Section */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="px-1 space-y-2 text-xs text-creator-text-secondary">
          {isChannelVerified && (
            <div className="flex items-start">
              <SolidVideoCameraIcon className="w-4 h-4 mr-2 mt-0.5 text-creator-primary flex-shrink-0" />
              <div>
                <span className="font-semibold text-creator-text-primary">
                  Channel:
                </span>{" "}
                {userProfile.youtubeChannelName || "N/A"}
                <br />({userProfile.subscriberCount?.toLocaleString() ||
                  "0"}{" "}
                subs, {userProfile.videoCount || "0"} videos)
              </div>
            </div>
          )}
          {isWalletConnected && (
            <div className="flex items-start">
              <IdentificationIcon className="w-4 h-4 mr-2 mt-0.5 text-protocol-blue flex-shrink-0" />
              <div>
                <span className="font-semibold text-creator-text-primary">
                  Web3 ID:
                </span>{" "}
                {walletInfo.label ? `${walletInfo.label}` : ""}
                <br />({walletInfo.accounts[0].address.substring(0, 6)}...
                {walletInfo.accounts[0].address.substring(
                  walletInfo.accounts[0].address.length - 4
                )}
                )
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
