
import { useState, useCallback, useEffect } from 'react';
import { IPRegistration, IPRegistrationStatus, Remix, Video } from '../types';
import { MOCK_API_DELAY, INITIAL_IP_REGISTRATIONS, MOCK_REMIXES } from '../constants';
import { useAuth } from './useAuth';

interface StoryProtocolHook {
  ipRegistrations: Record<string, IPRegistration>;
  isLoadingRegistration: Record<string, boolean>;
  registerIp: (video: Video, licenseType: string) => Promise<boolean>; // Updated signature
  fetchIpStatus: (videoId: string) => Promise<IPRegistrationStatus | undefined>;
  getRemixes: (storyProtocolId: string) => Promise<Remix[]>;
  isLoadingRemixes: boolean;
}

export const useStoryProtocol = (): StoryProtocolHook => {
  const { isWalletConnected, walletInfo } = useAuth();
  const [ipRegistrations, setIpRegistrations] = useState<Record<string, IPRegistration>>({});
  const [isLoadingRegistration, setIsLoadingRegistration] = useState<Record<string, boolean>>({});
  const [isLoadingRemixes, setIsLoadingRemixes] = useState(false);

  useEffect(() => {
    // Initialize IP registrations with mock data
    const initialRegs: Record<string, IPRegistration> = {};
    Object.keys(INITIAL_IP_REGISTRATIONS).forEach(videoId => {
      const status = INITIAL_IP_REGISTRATIONS[videoId];
      initialRegs[videoId] = {
        videoId,
        status: status,
        storyProtocolId: status === IPRegistrationStatus.REGISTERED ? `${videoId}_story_id` : undefined,
        registrationDate: status === IPRegistrationStatus.REGISTERED ? new Date().toISOString() : undefined,
        // Mock licenseType for already registered IPs for consistency in demo, if applicable
        licenseType: status === IPRegistrationStatus.REGISTERED ? 'NC-REMIX' : undefined 
      };
    });
    setIpRegistrations(initialRegs);
  }, []);

  // Updated signature to accept licenseType
  const registerIp = useCallback(async (video: Video, licenseType: string): Promise<boolean> => {
    if (!isWalletConnected || !walletInfo) {
      console.error("Wallet not connected for IP registration.");
      alert("Please connect your wallet first.");
      return false;
    }
    setIsLoadingRegistration(prev => ({ ...prev, [video.id]: true }));
    setIpRegistrations(prev => ({
      ...prev,
      [video.id]: { 
        videoId: video.id, 
        status: IPRegistrationStatus.PENDING,
        licenseType: licenseType // Store pending license
      }
    }));

    console.log(`Registering IP for video "${video.title}" with license: ${licenseType}`); // Log selected license

    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY * 2)); // Simulate minting
      // In a real app, interact with Story Protocol SDK
      const storyProtocolId = `${video.id}_story_id_${Date.now()}`;
      const transactionHash = `0x${Math.random().toString(16).slice(2)}...`;
      
      setIpRegistrations(prev => ({
        ...prev,
        [video.id]: {
          videoId: video.id,
          status: IPRegistrationStatus.REGISTERED,
          storyProtocolId,
          registrationDate: new Date().toISOString(),
          transactionHash,
          licenseType: licenseType, // Store final license
        }
      }));
      return true;
    } catch (error) {
      console.error("IP Registration failed:", error);
      setIpRegistrations(prev => ({
        ...prev,
        [video.id]: { 
            videoId: video.id, 
            status: IPRegistrationStatus.FAILED,
            licenseType: licenseType // Keep licenseType even on failure
        }
      }));
      return false;
    } finally {
      setIsLoadingRegistration(prev => ({ ...prev, [video.id]: false }));
    }
  }, [isWalletConnected, walletInfo]);

  const fetchIpStatus = useCallback(async (videoId: string): Promise<IPRegistrationStatus | undefined> => {
    // This is mostly illustrative as status is in ipRegistrations state
    // In a real app, this might query Story Protocol
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2));
    return ipRegistrations[videoId]?.status;
  }, [ipRegistrations]);

  const getRemixes = useCallback(async (storyProtocolId: string): Promise<Remix[]> => {
    setIsLoadingRemixes(true);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    // In a real app, query Story Protocol's Relationship module
    const remixes = MOCK_REMIXES[storyProtocolId] || [];
    setIsLoadingRemixes(false);
    return remixes;
  }, []);


  return { ipRegistrations, isLoadingRegistration, registerIp, fetchIpStatus, getRemixes, isLoadingRemixes };
};
