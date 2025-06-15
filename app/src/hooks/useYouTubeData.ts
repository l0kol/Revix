
import { useState, useEffect, useCallback } from 'react';
import { Video } from '../types';
import { MOCK_VIDEOS, MOCK_API_DELAY } from '../constants';
import { useAuth } from './useAuth';

interface YouTubeDataHook {
  videos: Video[];
  isLoadingVideos: boolean;
  error: string | null;
  fetchVideos: () => void;
}

export const useYouTubeData = (): YouTubeDataHook => {
  const { isWalletConnected } = useAuth(); // Changed from isAuthenticated
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!isWalletConnected) { // Changed from !isAuthenticated
      setVideos([]); 
      return;
    }
    setIsLoadingVideos(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      setVideos(MOCK_VIDEOS);
    } catch (e) {
      setError('Failed to fetch videos.');
      console.error(e);
    } finally {
      setIsLoadingVideos(false);
    }
  }, [isWalletConnected]); // Changed from isAuthenticated

  useEffect(() => {
    if (isWalletConnected) { // Changed from isAuthenticated
      fetchVideos();
    } else {
      setVideos([]); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected]); // Changed from isAuthenticated, fetchVideos is memoized

  return { videos, isLoadingVideos, error, fetchVideos };
};