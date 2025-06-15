
import React, { useState } from 'react';
import { Video } from '../types';
import Spinner from './Spinner';

interface LicenseOption {
  id: string;
  name: string;
  explanation: string;
}

const LICENSE_OPTIONS: LicenseOption[] = [
  {
    id: 'NC-REMIX',
    name: 'Non-Commercial Social Remixing',
    explanation: 'Allows others to remix and adapt your IP non-commercially. Derivative IP must also use this license and credit you.'
  },
  {
    id: 'COMMERCIAL-REMIX',
    name: 'Commercial Remix',
    explanation: 'Allows others to remix and adapt your IP, even for commercial purposes. Derivative IP must also use this license and credit you.'
  },
  {
    id: 'COMMERCIAL-USE',
    name: 'Commercial Use (No Derivatives)',
    explanation: 'Allows others to use your IP in its original form for commercial purposes (e.g., ads). Does not permit creating derivative works.'
  },
  {
    id: 'CC-BY',
    name: 'Creative Commons Attribution (CC BY)',
    explanation: 'Lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation.'
  }
];

interface RegisterModalContentProps {
  video: Video;
  onConfirmRegistration: (selectedLicense: string) => void; // Updated prop
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
}

const RegisterModalContent: React.FC<RegisterModalContentProps> = ({ video, onConfirmRegistration, onCancel, isLoading, error }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<string>(LICENSE_OPTIONS[0].id); // Default to first option

  const handleProceed = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleConfirm = () => {
    onConfirmRegistration(selectedLicense);
  };

  const getSelectedLicenseExplanation = () => {
    return LICENSE_OPTIONS.find(opt => opt.id === selectedLicense)?.explanation || '';
  }

  if (currentStep === 1) {
    return (
      <div>
        <p className="text-creator-text-secondary mb-4">
          Review the video details before proceeding to license selection for IP registration on Story Protocol:
        </p>
        <div className="bg-creator-surface p-4 rounded-md mb-6">
          <h4 className="font-semibold text-lg text-creator-text-primary mb-1">{video.title}</h4>
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto rounded-md object-cover max-h-60 mb-2" />
          <p className="text-sm text-creator-text-secondary"><strong>Upload Date:</strong> {new Date(video.uploadDate).toLocaleDateString()}</p>
          <p className="text-sm text-creator-text-secondary"><strong>Description:</strong> {video.description.substring(0,100)}...</p>
        </div>
        <p className="text-sm text-creator-text-secondary mb-4">
          This action will (simulated) mint an NFT representing your IP. Ensure your connected wallet has sufficient funds for gas fees (not applicable in this demo).
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-creator-text-primary font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={isLoading}
            className="px-4 py-2 bg-protocol-blue hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center"
          >
            Proceed to License Selection
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-creator-text-primary mb-1">Select License Type</h3>
        <p className="text-creator-text-secondary mb-4">Choose the license under which you want to register your IP.</p>
        
        <div className="space-y-3 mb-4">
          {LICENSE_OPTIONS.map((option) => {
            const isDefaultOption = option.id === 'NC-REMIX';
            const isSelected = selectedLicense === option.id;
            
            let selectionClasses = 'bg-creator-surface border-gray-600 hover:border-gray-500'; // Default for unselected
            if (isSelected) {
              // Always use blue theme when selected
              selectionClasses = 'bg-protocol-blue/20 border-protocol-blue ring-2 ring-protocol-blue';
            }

            return (
              <label
                key={option.id}
                className={`block p-3 rounded-md border cursor-pointer transition-all duration-150 ease-in-out ${selectionClasses}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="licenseType"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedLicense(option.id)}
                    className="form-radio h-4 w-4 mr-3 text-protocol-blue focus:ring-protocol-blue" // Consistently blue when checked
                  />
                  <span className="font-medium text-creator-text-primary">
                    {option.name}
                    {isDefaultOption && <span className="text-xs text-gray-400 ml-1">(Default)</span>}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {selectedLicense && (
          <div className="bg-white p-3 rounded-md mb-6 border border-gray-300">
            <p className="text-sm text-gray-800">{getSelectedLicenseExplanation()}</p>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-between items-center">
           <button
            onClick={handleBack}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-creator-text-primary font-medium rounded-md transition-colors"
          >
            Back
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-creator-text-primary font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-creator-primary hover:bg-red-700 text-white font-medium rounded-md transition-colors flex items-center"
            >
              {isLoading ? <Spinner size="sm" color="text-white"/> : 'Confirm Registration'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null; // Should not happen
};

export default RegisterModalContent;
