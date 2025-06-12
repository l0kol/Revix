import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"; // Using lucide-react for icons

// Define props for the YoutubeVideoList component
interface YoutubeVideoListProps {
  accessToken: string; // The OAuth access token for the user
}

// YoutubeVideoList component to fetch and display user's YouTube videos
const YoutubeVideoList: React.FC<YoutubeVideoListProps> = ({ accessToken }) => {
  // State variables for fetched videos, loading status, and error message
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  // useEffect hook to fetch videos whenever the accessToken changes
  useEffect(() => {
    // Function to fetch YouTube videos
    const fetchYoutubeVideos = async () => {
      // Clear previous error and video data, and set loading state
      setError(null);
      setVideos([]);
      setMessage("");
      setLoading(true);

      // If no access token is provided, set an error and stop
      if (!accessToken) {
        setError(
          "No access token provided. Please ensure you pass a valid token to the component."
        );
        setLoading(false);
        return;
      }

      try {
        // --- Step 1: Get the user's channel information to find their uploads playlist ID ---
        const channelApiUrl =
          "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true";
        const channelResponse = await fetch(channelApiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          setError(
            `Error fetching channel info: ${channelResponse.status} ${
              channelResponse.statusText
            } - ${errorData.error?.message || "Unknown error"}`
          );
          setLoading(false);
          return;
        }

        const channelData = await channelResponse.json();
        const uploadsPlaylistId =
          channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
          setMessage(
            "Could not find an uploads playlist for this user. They might not have uploaded videos or the token lacks necessary permissions."
          );
          setLoading(false);
          return;
        }

        // --- Step 2: Use the uploads playlist ID to fetch the videos ---
        // YouTube Data API endpoint to fetch videos from a specific playlist
        const playlistItemsApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10`;
        const playlistItemsResponse = await fetch(playlistItemsApiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        if (!playlistItemsResponse.ok) {
          const errorData = await playlistItemsResponse.json();
          setError(
            `Error fetching uploaded videos: ${playlistItemsResponse.status} ${
              playlistItemsResponse.statusText
            } - ${errorData.error?.message || "Unknown error"}`
          );
          setLoading(false);
          return;
        }

        const data = await playlistItemsResponse.json();

        // Update the videos state with the fetched items
        if (data.items && data.items.length > 0) {
          // Filter out videos that are not directly uploaded (e.g., private videos might not show snippet.title)
          // Also, playlist items don't have a direct 'id' at the top level, it's inside contentDetails
          const uploadedVideos = data.items.map((item: any) => ({
            id: item.contentDetails.videoId, // Video ID is nested here for playlist items
            snippet: item.snippet,
          }));
          setVideos(uploadedVideos);
          setMessage(
            `Successfully fetched ${uploadedVideos.length} uploaded videos.`
          );
        } else {
          setMessage("No uploaded videos found for this user.");
        }
      } catch (err: any) {
        // Catch any network or parsing errors
        setError(`Failed to fetch videos: ${err.message}`);
      } finally {
        // Always set loading to false after the fetch operation completes
        setLoading(false);
      }
    };

    // Call the fetch function when the component mounts or accessToken changes
    fetchYoutubeVideos();
  }, [accessToken]); // Dependency array: re-run effect if accessToken changes

  return (
    <div className="p-4">
      {/* Display loading indicator */}
      {loading && (
        <div className="flex items-center justify-center p-4 text-indigo-600">
          <Loader2 className="animate-spin mr-2" size={24} /> Loading YouTube
          Videos...
        </div>
      )}

      {/* Display messages */}
      {message && !loading && (
        <p
          className={`mt-4 p-3 rounded-lg text-sm ${
            error
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {message}
        </p>
      )}

      {/* Display errors */}
      {error && !loading && (
        <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
          <p className="font-semibold mb-1">Error fetching videos:</p>
          <pre className="whitespace-pre-wrap break-words">{error}</pre>
        </div>
      )}

      {/* Display fetched videos */}
      {videos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Your Uploaded Videos:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-200 hover:scale-[1.02]"
              >
                <img
                  src={
                    video.snippet.thumbnails.medium?.url ||
                    "https://placehold.co/320x180/E0E7FF/4F46E5?text=No+Thumbnail"
                  }
                  alt={video.snippet.title}
                  className="w-full h-auto object-cover"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/320x180/E0E7FF/4F46E5?text=No+Thumbnail";
                  }}
                />
                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-2">
                    {video.snippet.title}
                  </h3>
                  <p className="text-gray-500 text-xs line-clamp-1">
                    Channel: {video.snippet.channelTitle}
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition duration-200"
                  >
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default YoutubeVideoList;
