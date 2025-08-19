import { useEffect, useState } from 'react';

import { createLiveUrl, deleteLiveUrl, getLiveUrls, updateLiveUrl } from '~/features/live-url/service/live-url-service';
import type { LiveUrl } from '~/features/live-url/types/live-url';
import { Sport } from '~/shared/types/sport';

export function useLiveUrl() {
  const [liveUrls, setLiveUrls] = useState<Record<Sport, LiveUrl[]>>({
    [Sport.FOOTBALL]: [],
    [Sport.BASKETBALL]: [],
    [Sport.BASEBALL]: [],
    [Sport.RUGBY]: [],
    [Sport.ICE_HOCKEY]: [],
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchBySport = async (sport: Sport) => {
    try {
      setError(null);
      const response = await getLiveUrls(sport);
      setLiveUrls((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchAll = async () => {
    try {
      setError(null);

      const responses = await Promise.all(Object.values(Sport).map((sport) => getLiveUrls(sport)));

      const newLiveUrls: Record<Sport, LiveUrl[]> = {
        [Sport.FOOTBALL]: responses[0]?.data || [],
        [Sport.BASKETBALL]: responses[1]?.data || [],
        [Sport.BASEBALL]: responses[2]?.data || [],
        [Sport.RUGBY]: responses[3]?.data || [],
        [Sport.ICE_HOCKEY]: responses[4]?.data || [],
      };

      setLiveUrls(newLiveUrls);
    } catch (err) {
      setError(err as Error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (sport: Sport, broadcastName: string, url: string) => {
    try {
      setError(null);
      const response = await createLiveUrl(sport, broadcastName, url);
      setLiveUrls((prev) => ({
        ...prev,
        [sport]: [...prev[sport], response.data],
      }));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleUpdate = async (id: string, sport: Sport, broadcastName?: string, url?: string) => {
    try {
      setError(null);
      const response = await updateLiveUrl(id, broadcastName, url);
      setLiveUrls((prev) => ({
        ...prev,
        [sport]: prev[sport].map((item) => (item.id === id ? response.data : item)),
      }));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleDelete = async (id: string, sport: Sport) => {
    try {
      setError(null);
      await deleteLiveUrl(id);
      setLiveUrls((prev) => ({
        ...prev,
        [sport]: prev[sport].filter((item) => item.id !== id),
      }));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    liveUrls,
    error,
    refetch: fetchAll,
    refetchBySport: fetchBySport,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
