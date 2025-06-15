import React, { useState, useCallback, useMemo } from "react";
import { useYouTubeData } from "../hooks/useYouTubeData";
import { useStoryProtocol } from "../hooks/useStoryProtocol";
import { useAuth } from "../hooks/useAuth";
import VideoCard from "./VideoCard";
import Spinner from "./Spinner";
import Modal from "./Modal";
import RegisterModalContent from "@/components/RegisterModalContent"; // Updated path
import IPDetailsModalContent from "./IPDetailsModalContent";
import { Video, IPRegistration, IPRegistrationStatus } from "../types";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const DashboardPage: React.FC = () => {
  const { videos, isLoadingVideos, error: videosError } = useYouTubeData();
  const { ipRegistrations, isLoadingRegistration, registerIp } =
    useStoryProtocol();
  const { isWalletConnected, isChannelVerified } = useAuth(); // Changed from isAuthenticated

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date_desc");

  // Add these state declarations at the top of your component

  const handleOpenRegisterModal = (video: Video) => {
    if (!isChannelVerified) {
      alert("Please verify your channel ownership before registering IP.");
      return;
    }
    setSelectedVideo(video);
    setRegistrationError(null);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setSelectedVideo(null);
  };

  // Updated to accept licenseType
  const handleConfirmRegistration = async (licenseType: string) => {
    if (selectedVideo) {
      setRegistrationError(null); // Clear previous errors
      const success = await registerIp(selectedVideo, licenseType); // Pass licenseType
      if (success) {
        handleCloseRegisterModal();
      } else {
        setRegistrationError("Failed to register IP. Please try again.");
      }
    }
  };

  const handleOpenDetailsModal = (video: Video, ipInfo: IPRegistration) => {
    setSelectedVideo(video);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVideo(null);
  };

  const processedVideos = useMemo(() => {
    let filtered = [...videos];

    if (searchTerm.trim()) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    switch (sortOption) {
      case "date_asc":
        filtered.sort(
          (a, b) =>
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        );
        break;
      case "date_desc":
        filtered.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
        break;
      case "views_asc":
        filtered.sort((a, b) => a.viewCount - b.viewCount);
        break;
      case "views_desc":
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      default:
        break;
    }
    return filtered;
  }, [videos, searchTerm, sortOption]);

  if (!isWalletConnected) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-creator-text-secondary">
          Please connect your wallet to view your videos and manage IP.
        </p>
      </div>
    );
  }

  if (isLoadingVideos) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (videosError) {
    return (
      <p className="text-red-500 text-center py-10">
        Error fetching videos: {videosError}
      </p>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-creator-text-primary mb-6">
        My YouTube Videos
      </h2>

      <div className="mb-8 p-4 bg-creator-surface rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-creator-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search videos by title..."
            className="w-full bg-creator-background border border-gray-600 text-creator-text-primary rounded-md py-2.5 pl-10 pr-4 focus:ring-protocol-blue focus:border-protocol-blue transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex-grow w-full sm:w-auto sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-creator-text-secondary" />
          </div>
          <select
            className="w-full bg-creator-background border border-gray-600 text-creator-text-primary rounded-md py-2.5 pl-10 pr-4 focus:ring-protocol-blue focus:border-protocol-blue appearance-none transition-colors"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date_desc">Sort by Date (Newest)</option>
            <option value="date_asc">Sort by Date (Oldest)</option>
            <option value="views_desc">Sort by Views (Most)</option>
            <option value="views_asc">Sort by Views (Fewest)</option>
          </select>
        </div>
      </div>

      {processedVideos.length === 0 && !isLoadingVideos && (
        <p className="text-creator-text-secondary text-center py-10">
          {searchTerm
            ? "No videos match your search."
            : "No videos found. Ensure your YouTube channel is connected and has videos."}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {processedVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            ipRegistration={ipRegistrations[video.id]}
            onRegisterIp={handleOpenRegisterModal}
            onViewDetails={handleOpenDetailsModal}
            isRegistering={isLoadingRegistration[video.id] || false}
            isChannelVerified={isChannelVerified}
          />
        ))}
      </div>

      {selectedVideo && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={handleCloseRegisterModal}
          title="Register IP on Story Protocol"
        >
          <RegisterModalContent
            video={selectedVideo}
            onConfirmRegistration={handleConfirmRegistration} // Updated to pass the function that now expects licenseType
            onCancel={handleCloseRegisterModal}
            isLoading={isLoadingRegistration[selectedVideo.id] || false}
            error={registrationError}
          />
        </Modal>
      )}

      {selectedVideo &&
        ipRegistrations[selectedVideo.id]?.status ===
          IPRegistrationStatus.REGISTERED && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            title="IP Registration Details"
          >
            <IPDetailsModalContent
              video={selectedVideo}
              ipRegistration={ipRegistrations[selectedVideo.id]}
              onClose={handleCloseDetailsModal}
            />
          </Modal>
        )}
    </div>
  );
};

export default DashboardPage;
