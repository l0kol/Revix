
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStoryProtocol } from '../hooks/useStoryProtocol';
import { useYouTubeData } from '../hooks/useYouTubeData';
import { useAuth } from '../hooks/useAuth';
import { Video, Remix, IPRegistrationStatus } from '../types';
import Spinner from './Spinner';
import RemixCard from '@/components/RemixCard'; // Use mapped path
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link as RouterLink } from 'react-router-dom';
import { PresentationChartLineIcon, AdjustmentsHorizontalIcon, HashtagIcon, FireIcon, CurrencyDollarIcon, Cog6ToothIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';


interface RegisteredIpInfo {
  storyProtocolId: string;
  originalVideoTitle: string;
  originalVideoThumbnailUrl: string;
  originalVideoId: string; // The YouTube video ID
}

const RemixesPage: React.FC = () => {
  const { videos, isLoadingVideos: isLoadingYouTubeVideos } = useYouTubeData();
  const { ipRegistrations, getRemixes, isLoadingRemixes: isLoadingStoryRemixes } = useStoryProtocol();
  const { isWalletConnected } = useAuth();

  const [registeredIpList, setRegisteredIpList] = useState<RegisteredIpInfo[]>([]);
  const [selectedIpData, setSelectedIpData] = useState<RegisteredIpInfo | null>(null);
  const [remixList, setRemixList] = useState<Remix[]>([]);
  const [sortOption, setSortOption] = useState('date_desc');
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (videos.length > 0 && Object.keys(ipRegistrations).length > 0) {
      const filtered: RegisteredIpInfo[] = videos
        .filter(v => ipRegistrations[v.id]?.status === IPRegistrationStatus.REGISTERED && ipRegistrations[v.id]?.storyProtocolId)
        .map(v => ({
          storyProtocolId: ipRegistrations[v.id]!.storyProtocolId!,
          originalVideoTitle: v.title,
          originalVideoThumbnailUrl: v.thumbnailUrl,
          originalVideoId: v.id,
        }));
      setRegisteredIpList(filtered);
      if (filtered.length > 0 && !selectedIpData) {
        setSelectedIpData(filtered[0]);
      } else if (filtered.length === 0) {
        setSelectedIpData(null); // Clear selection if no registered IPs
      }
    } else if (!isLoadingYouTubeVideos) { // If videos done loading and it's empty
        setRegisteredIpList([]);
        setSelectedIpData(null);
    }
  }, [videos, ipRegistrations, isLoadingYouTubeVideos, selectedIpData]);

  useEffect(() => {
    if (selectedIpData?.storyProtocolId) {
      const fetchRemixesForIp = async () => {
        const fetchedRemixes = await getRemixes(selectedIpData.storyProtocolId);
        setRemixList(fetchedRemixes);
      };
      fetchRemixesForIp();
    } else {
      setRemixList([]);
    }
  }, [selectedIpData, getRemixes]);

  const handleSelectIp = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const foundIp = registeredIpList.find(ip => ip.storyProtocolId === event.target.value);
    setSelectedIpData(foundIp || null);
    setSearchTerm(''); // Reset search term on IP change
  };

  const isLoading = isLoadingYouTubeVideos || isLoadingStoryRemixes;

  const filteredAndSortedRemixes = useMemo(() => {
    let processedRemixes = [...remixList];

    if (searchTerm.trim()) {
        processedRemixes = processedRemixes.filter(remix => 
            remix.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            remix.remixerWallet.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
    }

    switch (sortOption) {
      case 'date_asc':
        processedRemixes.sort((a, b) => new Date(a.remixDate).getTime() - new Date(b.remixDate).getTime());
        break;
      case 'date_desc':
        processedRemixes.sort((a, b) => new Date(b.remixDate).getTime() - new Date(a.remixDate).getTime());
        break;
      case 'views_desc':
        processedRemixes.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'views_asc':
        processedRemixes.sort((a, b) => a.viewCount - b.viewCount);
        break;
      case 'earnings_desc':
        processedRemixes.sort((a, b) => b.earnings - a.earnings);
        break;
      case 'earnings_asc':
        processedRemixes.sort((a, b) => a.earnings - b.earnings);
        break;
      default:
        break;
    }
    return processedRemixes;
  }, [remixList, sortOption, searchTerm]);

  const summaryStats = useMemo(() => {
    if (!remixList || remixList.length === 0) {
      return { totalRemixes: 0, mostViralRemix: null, totalEarnings: 0 };
    }
    const totalRemixes = remixList.length;
    const mostViralRemix = remixList.reduce((prev, current) => (prev.viewCount > current.viewCount) ? prev : current, remixList[0]);
    const totalEarnings = remixList.reduce((sum, r) => sum + r.earnings, 0);
    return { totalRemixes, mostViralRemix, totalEarnings };
  }, [remixList]);

  const remixActivityChartData = useMemo(() => {
    const SPREAD_MONTHS = 6; // Show activity over last N months
    const countsByMonth: { [key: string]: number } = {};
    const monthLabels: string[] = [];

    for (let i = SPREAD_MONTHS -1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        countsByMonth[monthYear] = 0; // Initialize with 0
        monthLabels.push(monthYear);
    }
    
    remixList.forEach(remix => {
      const remixDate = new Date(remix.remixDate);
      const monthYear = remixDate.toLocaleString('default', { month: 'short', 'year': '2-digit' });
      if (countsByMonth.hasOwnProperty(monthYear)) {
        countsByMonth[monthYear]++;
      }
    });

    return monthLabels.map(label => ({
      name: label,
      remixes: countsByMonth[label] || 0,
    }));
  }, [remixList]);

  if (!isWalletConnected) {
    return (
      <div className="text-center py-20">
        <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-2xl text-creator-text-secondary">Please connect your wallet to view remix information.</p>
      </div>
    );
  }

  if (isLoadingYouTubeVideos && registeredIpList.length === 0) { // Initial loading state for IP list
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
        <p className="ml-4 text-xl text-creator-text-secondary">Loading your IP portfolio...</p>
      </div>
    );
  }

  if (!isLoadingYouTubeVideos && registeredIpList.length === 0) {
    return (
      <div className="text-center py-20">
         <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-creator-text-primary mb-3">No Registered IPs Found</h3>
        <p className="text-creator-text-secondary max-w-md mx-auto mb-6">
          You haven't registered any videos as IP on Story Protocol yet. 
          Go to "My Videos" to register your content and start tracking remixes.
        </p>
        <RouterLink
          to="/dashboard"
          className="bg-protocol-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out inline-flex items-center text-lg"
        >
          Go to My Videos
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-creator-text-primary mb-6 flex items-center">
        <PresentationChartLineIcon className="w-8 h-8 mr-3 text-creator-primary"/>
        Remix Analytics Dashboard
      </h2>
      
      <div className="mb-8">
        <label htmlFor="ipSelector" className="block text-sm font-medium text-creator-text-secondary mb-1">
          Select Registered IP to Analyze:
        </label>
        <select
          id="ipSelector"
          value={selectedIpData?.storyProtocolId || ''}
          onChange={handleSelectIp}
          className="w-full md:w-1/2 bg-creator-surface border border-gray-600 text-creator-text-primary rounded-md p-2.5 focus:ring-protocol-blue focus:border-protocol-blue shadow-sm"
          disabled={isLoadingYouTubeVideos || registeredIpList.length === 0}
        >
          {registeredIpList.length === 0 && <option value="" disabled>No registered IPs available</option>}
          {registeredIpList.map(ip => (
            <option key={ip.storyProtocolId} value={ip.storyProtocolId}>
              {ip.originalVideoTitle}
            </option>
          ))}
        </select>
      </div>

      {isLoadingStoryRemixes && selectedIpData && (
         <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
            <p className="ml-4 text-xl text-creator-text-secondary">Loading remixes for "{selectedIpData.originalVideoTitle}"...</p>
        </div>
      )}

      {!isLoadingStoryRemixes && selectedIpData && (
        <div className="space-y-8">
          {/* Original IP Header */}
          <div className="bg-creator-surface p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-6">
            <img 
                src={selectedIpData.originalVideoThumbnailUrl} 
                alt={selectedIpData.originalVideoTitle}
                className="w-full md:w-48 h-auto md:h-28 object-cover rounded-md shadow-md"
            />
            <div className="flex-grow text-center md:text-left">
              <p className="text-xs text-creator-text-secondary uppercase tracking-wider">Original IP</p>
              <h3 className="text-2xl font-semibold text-creator-text-primary mb-1 truncate" title={selectedIpData.originalVideoTitle}>
                {selectedIpData.originalVideoTitle}
              </h3>
              <p className="text-sm text-protocol-blue truncate">Story ID: {selectedIpData.storyProtocolId}</p>
            </div>
            <RouterLink
              to={`/ip-management?ipId=${selectedIpData.storyProtocolId}&videoId=${selectedIpData.originalVideoId}`} // Pass videoId if useful on that page
              className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors text-sm"
            >
              <Cog6ToothIcon className="w-5 h-5 mr-2" />
              Manage This IP
            </RouterLink>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-creator-surface p-5 rounded-lg shadow-lg text-center">
              <HashtagIcon className="w-8 h-8 mx-auto mb-2 text-sky-400"/>
              <p className="text-3xl font-bold text-creator-text-primary">{summaryStats.totalRemixes}</p>
              <p className="text-sm text-creator-text-secondary">Total Remixes</p>
            </div>
            <div className="bg-creator-surface p-5 rounded-lg shadow-lg text-center">
              <FireIcon className="w-8 h-8 mx-auto mb-2 text-red-500"/>
              <p className="text-lg font-semibold text-creator-text-primary truncate" title={summaryStats.mostViralRemix?.title || 'N/A'}>
                {summaryStats.mostViralRemix?.title || 'N/A'}
              </p>
              <p className="text-sm text-creator-text-secondary">Most Viral Remix ({summaryStats.mostViralRemix ? `${(summaryStats.mostViralRemix.viewCount/1000).toFixed(1)}k views` : 'N/A'})</p>
            </div>
            <div className="bg-creator-surface p-5 rounded-lg shadow-lg text-center">
              <CurrencyDollarIcon className="w-8 h-8 mx-auto mb-2 text-green-400"/>
              <p className="text-3xl font-bold text-creator-text-primary">${summaryStats.totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-creator-text-secondary">Total Remix Revenue (Mock)</p>
            </div>
          </div>
          
          {/* Remix Activity Chart */}
           {remixList.length > 0 && (
            <div className="bg-creator-surface p-6 rounded-lg shadow-xl">
              <h4 className="text-xl font-semibold text-creator-text-primary mb-4">Remix Activity (Last 6 Months)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={remixActivityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
                  <XAxis dataKey="name" stroke="#AAAAAA" tick={{fontSize: 12}}/>
                  <YAxis stroke="#AAAAAA" tick={{fontSize: 12}} allowDecimals={false} />
                  <Tooltip
                    cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} // protocol-blue with opacity
                    contentStyle={{backgroundColor: '#282828', border: '1px solid #4A4A4A', borderRadius: '0.25rem'}}
                    itemStyle={{color: '#FFFFFF'}}
                    labelStyle={{color: '#AAAAAA', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="remixes" name="New Remixes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Filters and Remix Grid */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-semibold text-creator-text-primary">
                Remix Showcase ({filteredAndSortedRemixes.length})
              </h3>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-creator-text-secondary" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search remixes by title/wallet..."
                        className="w-full bg-creator-background border border-gray-600 text-creator-text-primary rounded-md py-2 pl-10 pr-3 focus:ring-protocol-blue focus:border-protocol-blue transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-creator-text-secondary" />
                    </div>
                    <select
                        className="w-full bg-creator-background border border-gray-600 text-creator-text-primary rounded-md py-2 pl-10 pr-3 focus:ring-protocol-blue focus:border-protocol-blue appearance-none transition-colors"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="date_desc">Sort by Date (Newest)</option>
                        <option value="date_asc">Sort by Date (Oldest)</option>
                        <option value="views_desc">Sort by Views (Most)</option>
                        <option value="views_asc">Sort by Views (Fewest)</option>
                        <option value="earnings_desc">Sort by Earnings (Most)</option>
                        <option value="earnings_asc">Sort by Earnings (Fewest)</option>
                    </select>
                </div>
              </div>
            </div>

            {filteredAndSortedRemixes.length === 0 ? (
              <div className="text-center py-10 bg-creator-surface rounded-lg shadow">
                 <MagnifyingGlassIcon className="w-12 h-12 text-creator-text-secondary mx-auto mb-3" />
                <p className="text-creator-text-secondary text-lg">
                    {searchTerm ? "No remixes match your search criteria." : "No remixes found for this IP yet."}
                </p>
                { !searchTerm && (
                     <p className="text-sm text-creator-text-secondary mt-2">Share your IP to inspire others to create!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedRemixes.map(remix => (
                  <RemixCard key={remix.id} remix={remix} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {!selectedIpData && !isLoadingYouTubeVideos && registeredIpList.length > 0 && (
         <div className="text-center py-20">
            <p className="text-xl text-creator-text-secondary">Select a registered IP from the dropdown above to see its remix analytics.</p>
        </div>
      )}
    </div>
  );
};

export default RemixesPage;
