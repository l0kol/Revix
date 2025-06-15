
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const IPManagementPage: React.FC = () => {
  const { isWalletConnected } = useAuth(); // Changed from isAuthenticated

  if (!isWalletConnected) { // Changed from !isAuthenticated
    return (
      <div className="text-center py-10">
        <p className="text-xl text-creator-text-secondary">Please connect your wallet to manage your IP.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-creator-text-primary mb-8 flex items-center">
        <ShieldCheckIcon className="w-8 h-8 mr-3 text-protocol-blue" />
        IP Management
      </h2>
      
      <div className="bg-creator-surface p-8 rounded-lg shadow-xl text-center">
        <InformationCircleIcon className="w-16 h-16 text-protocol-blue mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-creator-text-primary mb-3">Advanced IP Management Features</h3>
        <p className="text-creator-text-secondary mb-6 max-w-2xl mx-auto">
          This section is planned for advanced IP management functionalities, such as:
        </p>
        <ul className="list-disc list-inside text-left text-creator-text-secondary max-w-md mx-auto space-y-2">
          <li>Managing licenses for your IP</li>
          <li>Setting up royalty splits for collaborations</li>
          <li>Tracking IP usage across platforms (beyond YouTube remixes)</li>
          <li>Optional: Staking royalties as collateral for new IP registrations</li>
        </ul>
        <p className="text-creator-text-secondary mt-8">
          These features are part of the future vision that would involve deeper integration with Story Protocol and other Web3 services.
        </p>
      </div>
    </div>
  );
};

export default IPManagementPage;