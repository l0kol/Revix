
import React from 'react';
import { Video, IPRegistration, IPRegistrationStatus } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface VideoCardProps {
  video: Video;
  ipRegistration?: IPRegistration;
  onRegisterIp: (video: Video) => void;
  onViewDetails?: (video: Video, ipInfo: IPRegistration) => void; // For viewing registered IP details
  isRegistering: boolean;
  isChannelVerified: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, ipRegistration, onRegisterIp, onViewDetails, isRegistering, isChannelVerified }) => {
  const { title, thumbnailUrl, uploadDate, viewCount, monetizationStatus } = video;
  const registrationStatus = ipRegistration?.status || IPRegistrationStatus.NOT_REGISTERED;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const getStatusIndicator = () => {
    switch (registrationStatus) {
      case IPRegistrationStatus.REGISTERED:
        return <div className="flex items-center text-green-400"><CheckCircleIcon className="w-5 h-5 mr-1" /> Registered</div>;
      case IPRegistrationStatus.PENDING:
        return <div className="flex items-center text-yellow-400"><ClockIcon className="w-5 h-5 mr-1" /> Pending</div>;
      case IPRegistrationStatus.FAILED:
        return <div className="flex items-center text-red-400"><XCircleIcon className="w-5 h-5 mr-1" /> Failed</div>;
      case IPRegistrationStatus.NOT_REGISTERED:
      default:
        return <div className="flex items-center text-gray-400"><InformationCircleIcon className="w-5 h-5 mr-1" /> Not Registered</div>;
    }
  };

  return (
    <div className="bg-creator-surface rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
      <img className="w-full h-48 object-cover" src={thumbnailUrl} alt={title} />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-creator-text-primary mb-2 truncate" title={title}>{title}</h3>
        <p className="text-sm text-creator-text-secondary mb-1">Uploaded: {formatDate(uploadDate)}</p>
        <p className="text-sm text-creator-text-secondary mb-1">Views: {viewCount.toLocaleString()}</p>
        <p className="text-sm text-creator-text-secondary mb-3">Monetization: {monetizationStatus}</p>
        
        <div className="mt-auto">
          <div className="text-sm font-medium mb-3">{getStatusIndicator()}</div>
          {registrationStatus === IPRegistrationStatus.REGISTERED && onViewDetails && ipRegistration && (
            <button
              onClick={() => onViewDetails(video, ipRegistration)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
            >
              View IP Details
            </button>
          )}
          {registrationStatus !== IPRegistrationStatus.REGISTERED && registrationStatus !== IPRegistrationStatus.PENDING && (
            <button
              onClick={() => onRegisterIp(video)}
              disabled={isRegistering || !isChannelVerified}
              className={`w-full font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm flex items-center justify-center
                ${!isChannelVerified ? 'bg-gray-500 cursor-not-allowed' : 
                'bg-creator-primary hover:bg-red-700 text-white'}`}
            >
              {isRegistering ? <Spinner size="sm" color="text-white"/> : 'Register IP'}
            </button>
          )}
          {!isChannelVerified && registrationStatus !== IPRegistrationStatus.REGISTERED && (
             <p className="text-xs text-yellow-400 mt-2 text-center">Verify channel to register IP.</p>
          )}
          {registrationStatus === IPRegistrationStatus.PENDING && (
             <div className="w-full font-semibold py-2 px-4 rounded-md text-sm flex items-center justify-center bg-yellow-500 text-white">
                <Spinner size="sm" color="text-white"/>
                <span className="ml-2">Registering...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
    