
import React from 'react';
import RevixLogo from './RevixLogo';
import WalletIcon from './WalletIcon';
import Spinner from './Spinner';

interface LandingPageHeaderProps {
  onConnectWallet: () => void;
  isLoading: boolean;
}

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({ onConnectWallet, isLoading }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-creator-secondary/70 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center">
        <RevixLogo 
          width={32} 
          height={32} 
          primaryColor="#FF0000" 
          secondaryColor="#3B82F6" 
          glowColor="#FF0000"
          glowOpacity={0.4}
          glowStdDeviation={1.5}
        />
        <span className="ml-2.5 font-bold text-lg text-creator-text-primary">Revix</span>
      </div>
      <button
        onClick={onConnectWallet}
        disabled={isLoading}
        className="bg-protocol-blue hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center text-sm"
      >
        {isLoading ? (
          <Spinner size="sm" color="text-white" />
        ) : (
          <>
            <WalletIcon className="h-5 w-5 mr-2" />
            Connect Wallet
          </>
        )}
      </button>
    </header>
  );
};

export default LandingPageHeader;