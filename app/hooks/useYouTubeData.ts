import { useState, useEffect, useCallback } from "react";
import { Video } from "../types";
import { MOCK_VIDEOS, MOCK_API_DELAY } from "../constants";
import { useAuth } from "./useAuth";

interface YouTubeDataHook {
  videos: Video[];
  isLoadingVideos: boolean;
  error: string | null;
  fetchVideos: () => void;
}

export const useYouTubeData = (): YouTubeDataHook => {
  const { accessToken } = useAuth(); // Changed from isAuthenticated
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!accessToken) {
      // Changed from !isAuthenticated
      setVideos([]);
      return;
    }
    setIsLoadingVideos(true);
    setError(null);
    try {
      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error("Failed to fetch channel info");
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId =
        channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error("No uploads playlist found");
      }

      // Step 2: Fetch videos from uploads playlist
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Playlist response:", playlistResponse);

      if (!playlistResponse.ok) {
        throw new Error("Failed to fetch videos");
      }

      const playlistData = await playlistResponse.json();

      // Transform to Video type
      const fetchedVideos: Video[] = playlistData.items.map((item: any) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || "",
        uploadDate: item.snippet.publishedAt,
        viewCount: 0, // Will need separate API call for stats
        channelTitle: item.snippet.channelTitle,
      }));

      console.log("Fetched videos:", fetchedVideos);
      setVideos(fetchedVideos);
    } catch (e) {
      setError("Failed to fetch videos.");
      console.error(e);
    } finally {
      setIsLoadingVideos(false);
    }
  }, [accessToken]); // Changed from isAuthenticated

  useEffect(() => {
    if (accessToken) {
      // Changed from isAuthenticated
      fetchVideos();
    } else {
      setVideos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]); // Changed from isAuthenticated, fetchVideos is memoized

  return { videos, isLoadingVideos, error, fetchVideos };
};
