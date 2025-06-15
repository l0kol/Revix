
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useYouTubeData } from '../hooks/useYouTubeData';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { Video, IPRegistration, RevenueData, IPRegistrationStatus, InvestorShare } from '../types';
import Spinner from './Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InformationCircleIcon, AdjustmentsHorizontalIcon, CurrencyDollarIcon, PresentationChartLineIcon, CalendarDaysIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { MOCK_INVESTOR_SHARES, MOCK_API_DELAY } from '../constants';

interface VideoRevenueDetail extends Video {
  youtubeRevenue: number;
  storyProtocolRoyalties: number;
  totalRevenue: number;
  isRegistered: boolean;
  storyProtocolId?: string;
  lastPayoutDate?: string; // Added for the new column
}

// Helper function to generate mock revenue data for a single video
const getMockVideoRevenueData = (video: Video, isRegistered: boolean): { youtubeRevenue: number, storyProtocolRoyalties: number } => {
  const baseYoutubeRev = video.viewCount * 0.001 + (Math.random() * 50);
  let storyRev = 0;
  if (isRegistered) {
    storyRev = video.likeCount * 0.005 + (Math.random() * 20);
  }
  return {
    youtubeRevenue: parseFloat(baseYoutubeRev.toFixed(2)),
    storyProtocolRoyalties: parseFloat(storyRev.toFixed(2)),
  };
};


const RevenuePage: React.FC = () => {
  const { isWalletConnected } = useAuth();
  const { videos, isLoadingVideos: isLoadingYouTubeVideos } = useYouTubeData();
  const { ipRegistrations, isLoadingRegistration } = useStoryProtocol();

  const [videoRevenueDetails, setVideoRevenueDetails] = useState<VideoRevenueDetail[]>([]);
  const [sortOption, setSortOption] = useState('date_desc');
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [payoutLoadingStates, setPayoutLoadingStates] = useState<Record<string, boolean>>({});
  
  const [overallRevenueData, setOverallRevenueData] = useState<RevenueData>({ youtubeRevenue: 0, storyProtocolRoyalties: 0 });
  const [investorShares, setInvestorShares] = useState<InvestorShare[]>([]);

  useEffect(() => {
    if (isWalletConnected) {
      setTimeout(() => {
        setInvestorShares(MOCK_INVESTOR_SHARES);
      }, MOCK_API_DELAY / 2);
    } else {
      setInvestorShares([]);
    }
  }, [isWalletConnected]);

  useEffect(() => {
    // Early exit if essential data is missing or still loading.
    // This condition checks if we are not connected, or youtube videos are loading.
    // Or if IP registrations are empty BUT videos are present (implies ipRegistrations might still be initializing/empty).
    if (!isWalletConnected || isLoadingYouTubeVideos || (Object.keys(ipRegistrations).length === 0 && videos.length > 0)) {
      setIsLoadingDetails(true);
      setVideoRevenueDetails([]);
      setOverallRevenueData({ youtubeRevenue: 0, storyProtocolRoyalties: 0 });
      return;
    }
    
    // Process video details if videos are loaded and ipRegistrations are available (even if empty if no videos)
    if (videos.length > 0 && Object.keys(ipRegistrations).length > 0) {
        setIsLoadingDetails(true); // Start loading state for processing this batch
        const details: VideoRevenueDetail[] = videos.map(video => {
          const registration = ipRegistrations[video.id];
          const isRegistered = registration?.status === IPRegistrationStatus.REGISTERED;
          const { youtubeRevenue, storyProtocolRoyalties } = getMockVideoRevenueData(video, isRegistered);
          return {
            ...video,
            youtubeRevenue,
            storyProtocolRoyalties,
            totalRevenue: youtubeRevenue + storyProtocolRoyalties,
            isRegistered,
            storyProtocolId: registration?.storyProtocolId,
            lastPayoutDate: undefined // Initialize lastPayoutDate
          };
        });

      setVideoRevenueDetails(details);

      const totalYouTubeRevenue = details.reduce((sum, d) => sum + d.youtubeRevenue, 0);
      const totalStoryRoyalties = details.reduce((sum, d) => sum + d.storyProtocolRoyalties, 0);
      setOverallRevenueData({
        youtubeRevenue: parseFloat(totalYouTubeRevenue.toFixed(2)),
        storyProtocolRoyalties: parseFloat(totalStoryRoyalties.toFixed(2)),
      });
      setIsLoadingDetails(false);
    } else if (!isLoadingYouTubeVideos && videos.length === 0) {
      // Handle case where there are no videos (after loading is complete)
      setIsLoadingDetails(false);
      setVideoRevenueDetails([]);
      setOverallRevenueData({ youtubeRevenue: 0, storyProtocolRoyalties: 0 });
    }
    // Note: Removed the `isLoadingRegistration === undefined` check as it was logically flawed.
    // `isLoadingRegistration` (the object itself) isn't what determines if all IP reg data is ready,
    // rather the population of `ipRegistrations` state is key.
  }, [videos, ipRegistrations, isWalletConnected, isLoadingYouTubeVideos]); // isLoadingRegistration removed from dep array as it's a per-video status object

  const handlePayout = async (videoId: string) => {
    setPayoutLoadingStates(prev => ({ ...prev, [videoId]: true }));
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY * 1.5)); // Simulate API call

    setVideoRevenueDetails(prevDetails => {
      const newDetails = prevDetails.map(detail => {
        if (detail.id === videoId) {
          return {
            ...detail,
            youtubeRevenue: 0,
            storyProtocolRoyalties: 0,
            totalRevenue: 0,
            lastPayoutDate: new Date().toISOString(),
          };
        }
        return detail;
      });
      // Recalculate overall revenue after payout
      const totalYouTubeRevenue = newDetails.reduce((sum, d) => sum + d.youtubeRevenue, 0);
      const totalStoryRoyalties = newDetails.reduce((sum, d) => sum + d.storyProtocolRoyalties, 0);
      setOverallRevenueData({
        youtubeRevenue: parseFloat(totalYouTubeRevenue.toFixed(2)),
        storyProtocolRoyalties: parseFloat(totalStoryRoyalties.toFixed(2)),
      });
      return newDetails;
    });
    setPayoutLoadingStates(prev => ({ ...prev, [videoId]: false }));
  };

  const sortedVideoRevenueDetails = useMemo(() => {
    let sorted = [...videoRevenueDetails];
    switch (sortOption) {
      case 'date_asc':
        sorted.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
        break;
      case 'date_desc':
      default:
        sorted.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      case 'youtube_rev_asc':
        sorted.sort((a, b) => a.youtubeRevenue - b.youtubeRevenue);
        break;
      case 'youtube_rev_desc':
        sorted.sort((a, b) => b.youtubeRevenue - a.youtubeRevenue);
        break;
      case 'story_rev_asc':
        sorted.sort((a, b) => a.storyProtocolRoyalties - b.storyProtocolRoyalties);
        break;
      case 'story_rev_desc':
        sorted.sort((a, b) => b.storyProtocolRoyalties - a.storyProtocolRoyalties);
        break;
      case 'total_rev_asc':
        sorted.sort((a, b) => a.totalRevenue - b.totalRevenue);
        break;
      case 'total_rev_desc':
        sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
    }
    return sorted;
  }, [videoRevenueDetails, sortOption]);

  if (!isWalletConnected) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-creator-text-secondary">Please connect your wallet to view revenue and royalty information.</p>
      </div>
    );
  }
  
  const isLoading = isLoadingYouTubeVideos || isLoadingDetails;

  if (isLoading && !videoRevenueDetails.length && !Object.keys(ipRegistrations).length) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  const chartData = [
    { name: 'YouTube Revenue', value: overallRevenueData.youtubeRevenue, fill: '#FF0000' },
    { name: 'Story Protocol Royalties', value: overallRevenueData.storyProtocolRoyalties, fill: '#3B82F6' },
  ];
  const totalOverallRevenue = overallRevenueData.youtubeRevenue + overallRevenueData.storyProtocolRoyalties;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-creator-text-primary mb-8 flex items-center">
        <PresentationChartLineIcon className="w-8 h-8 mr-3 text-creator-primary"/>
        Revenue & Royalties Dashboard
      </h2>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-creator-surface p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-creator-text-primary mb-4">Overall Revenue</h3>
          {isLoading && totalOverallRevenue === 0 ? <Spinner size="md"/> : <p className="text-4xl font-bold text-green-400 mb-2">${totalOverallRevenue.toFixed(2)}</p>}
          <p className="text-sm text-creator-text-secondary">Total combined revenue from all sources.</p>
        </div>
        <div className="bg-creator-surface p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-creator-text-primary mb-4">Revenue Breakdown</h3>
          {isLoading && totalOverallRevenue === 0 ? <div className="h-[200px] flex items-center justify-center"><Spinner size="md"/></div> : 
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                <XAxis type="number" stroke="#AAAAAA" />
                <YAxis dataKey="name" type="category" stroke="#AAAAAA" width={150} tick={{fontSize: 12}}/>
                <Tooltip
                  cursor={{fill: '#373737'}}
                  contentStyle={{backgroundColor: '#282828', border: '1px solid #4A4A4A', borderRadius: '0.25rem'}}
                  itemStyle={{color: '#FFFFFF'}}
                  labelStyle={{color: '#AAAAAA', fontWeight: 'bold'}}
                />
                <Bar dataKey="value" barSize={30}>
                  {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Detailed Video Revenue */}
      <div className="bg-creator-surface p-6 rounded-lg shadow-xl mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-creator-text-primary">Detailed Video Revenue</h3>
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-creator-text-secondary" />
                </div>
                <select
                    className="w-full bg-creator-background border border-gray-600 text-creator-text-primary rounded-md py-2 pl-10 pr-4 focus:ring-protocol-blue focus:border-protocol-blue appearance-none transition-colors"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    disabled={isLoading && videoRevenueDetails.length === 0}
                >
                    <option value="date_desc">Sort by Date (Newest)</option>
                    <option value="date_asc">Sort by Date (Oldest)</option>
                    <option value="youtube_rev_desc">YouTube Rev (High-Low)</option>
                    <option value="youtube_rev_asc">YouTube Rev (Low-High)</option>
                    <option value="story_rev_desc">Story Rev (High-Low)</option>
                    <option value="story_rev_asc">Story Rev (Low-High)</option>
                    <option value="total_rev_desc">Total Rev (High-Low)</option>
                    <option value="total_rev_asc">Total Rev (Low-High)</option>
                </select>
            </div>
        </div>

        {isLoading && videoRevenueDetails.length === 0 ? (
            <div className="flex justify-center items-center h-48"><Spinner /></div>
        ) : sortedVideoRevenueDetails.length === 0 ? (
            <p className="text-creator-text-secondary text-center py-6">No video revenue details to display.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-creator-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Video Title</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Upload Date</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-creator-text-secondary uppercase tracking-wider">YouTube Rev.</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Story Protocol Rev.</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Total Rev.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Last Payout</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-creator-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-creator-surface divide-y divide-gray-700">
                {sortedVideoRevenueDetails.map((video) => (
                  <tr key={video.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-16 object-cover rounded mr-3" src={video.thumbnailUrl} alt="" />
                            <span className="text-sm font-medium text-creator-text-primary truncate" style={{maxWidth: '150px'}} title={video.title}>{video.title}</span>
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-creator-text-secondary">{new Date(video.uploadDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-creator-text-secondary">${video.youtubeRevenue.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        {video.isRegistered ? 
                            <span className="text-protocol-blue">${video.storyProtocolRoyalties.toFixed(2)}</span> : 
                            <span className="text-xs text-gray-500">N/A (Not IP)</span>
                        }
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-400">${video.totalRevenue.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-creator-text-secondary">
                      {video.lastPayoutDate ? new Date(video.lastPayoutDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handlePayout(video.id)}
                        disabled={video.totalRevenue <= 0 || payoutLoadingStates[video.id]}
                        className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors
                          ${video.totalRevenue > 0 && !payoutLoadingStates[video.id] ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                      >
                        {payoutLoadingStates[video.id] ? <Spinner size="sm" color="text-white"/> : 
                          <div className="flex items-center">
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1"/> Payout
                          </div>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Investor Shares (Mocked) */}
      {investorShares.length > 0 && (
        <div className="bg-creator-surface p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-creator-text-primary mb-6">Investor Shares & Payouts (Mock)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-creator-secondary">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">
                    Investor Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">
                    Share Percentage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-creator-text-secondary uppercase tracking-wider">
                    Total Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-creator-surface divide-y divide-gray-700">
                {investorShares.map((share, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-creator-text-primary">{share.investorAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-creator-text-secondary">{share.sharePercentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">${share.totalPaid.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-12 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-300">
          <InformationCircleIcon className="h-5 w-5 inline mr-1 mb-0.5" />
          Revenue data is currently mocked for demonstration purposes.
          Real integration would involve YouTube API and Story Protocol on-chain data.
        </p>
      </div>
    </div>
  );
};

export default RevenuePage;
