
import React, { useState, useEffect } from 'react';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { useYouTubeData } from '../hooks/useYouTubeData';
import { useAuth } from '../hooks/useAuth';
import { Video, Remix, IPRegistrationStatus } from '../types';
import Spinner from './Spinner';

const RemixesPage: React.FC = () => {
  const { videos, isLoadingVideos } = useYouTubeData();
  const { ipRegistrations, getRemixes, isLoadingRemixes } = useStoryProtocol();
  const { isWalletConnected } = useAuth(); // Changed from isAuthenticated
  
  const [selectedIpId, setSelectedIpId] = useState<string | null>(null);
  const [remixList, setRemixList] = useState<Remix[]>([]);
  const [registeredVideos, setRegisteredVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (videos.length > 0 && Object.keys(ipRegistrations).length > 0) {
      const filtered = videos.filter(v => ipRegistrations[v.id]?.status === IPRegistrationStatus.REGISTERED);
      setRegisteredVideos(filtered);
      if (filtered.length > 0 && !selectedIpId) {
         const storyProtocolId = ipRegistrations[filtered[0].id]?.storyProtocolId;
         if(storyProtocolId) setSelectedIpId(storyProtocolId);
      }
    }
  }, [videos, ipRegistrations, selectedIpId]);

  useEffect(() => {
    if (selectedIpId) {
      const fetchRemixes = async () => {
        const fetchedRemixes = await getRemixes(selectedIpId);
        setRemixList(fetchedRemixes);
      };
      fetchRemixes();
    } else {
      setRemixList([]);
    }
  }, [selectedIpId, getRemixes]);

  if (!isWalletConnected) { // Changed from !isAuthenticated
    return (
      <div className="text-center py-10">
        <p className="text-xl text-creator-text-secondary">Please connect your wallet to view remix information.</p>
      </div>
    );
  }
  
  const handleSelectIp = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIpId(event.target.value);
  };
  
  const getVideoTitleByStoryId = (storyId: string): string => {
    const videoEntry = Object.entries(ipRegistrations).find(([, reg]) => reg.storyProtocolId === storyId);
    if (videoEntry) {
      const video = videos.find(v => v.id === videoEntry[0]);
      return video?.title || 'Unknown Video';
    }
    return 'Unknown Video';
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-creator-text-primary mb-8">Remix Tracking</h2>
      
      {isLoadingVideos ? (
        <div className="flex justify-center items-center h-32"><Spinner /></div>
      ) : registeredVideos.length === 0 ? (
        <p className="text-creator-text-secondary">You have no registered IPs to track remixes for. Register your videos first.</p>
      ) : (
        <div className="mb-6">
          <label htmlFor="ipSelector" className="block text-sm font-medium text-creator-text-secondary mb-1">
            Select Registered IP:
          </label>
          <select
            id="ipSelector"
            value={selectedIpId || ''}
            onChange={handleSelectIp}
            className="w-full max-w-md bg-creator-surface border border-gray-600 text-creator-text-primary rounded-md p-2 focus:ring-protocol-blue focus:border-protocol-blue"
          >
            <option value="" disabled>Select a video</option>
            {registeredVideos.map(video => {
                const storyId = ipRegistrations[video.id]?.storyProtocolId;
                if (!storyId) return null;
                return (
                    <option key={storyId} value={storyId}>
                        {video.title}
                    </option>
                );
            })}
          </select>
        </div>
      )}

      {isLoadingRemixes ? (
         <div className="flex justify-center items-center h-32"><Spinner /></div>
      ) : selectedIpId && remixList.length === 0 ? (
        <p className="text-creator-text-secondary">No remixes found for "{getVideoTitleByStoryId(selectedIpId)}".</p>
      ) : selectedIpId && remixList.length > 0 ? (
        <div>
          <h3 className="text-2xl font-semibold text-creator-text-primary mb-4">
            Remixes of "{getVideoTitleByStoryId(selectedIpId)}"
          </h3>
          <div className="space-y-4">
            {remixList.map(remix => (
              <div key={remix.id} className="bg-creator-surface p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold text-creator-text-primary">{remix.title || 'Untitled Remix'}</h4>
                <p className="text-sm text-creator-text-secondary">
                  <a href={remix.remixVideoUrl} target="_blank" rel="noopener noreferrer" className="text-protocol-blue hover:underline">
                    View Remix Video
                  </a>
                </p>
                <p className="text-sm text-creator-text-secondary">Remixer Wallet: {remix.remixerWallet}</p>
                <p className="text-sm text-creator-text-secondary">Remix Date: {new Date(remix.remixDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RemixesPage;