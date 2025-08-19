import { useEffect, useState } from 'react';

import { getCheer, resetCheer } from '~/features/cheer/service/cheer-service';
import type { Cheer } from '~/features/cheer/types/cheer';
import { Sport } from '~/shared/types/sport';

export function useCheer() {
  const [cheers, setCheers] = useState<Record<Sport, Cheer | null>>({
    [Sport.FOOTBALL]: null,
    [Sport.BASKETBALL]: null,
    [Sport.BASEBALL]: null,
    [Sport.RUGBY]: null,
    [Sport.ICE_HOCKEY]: null,
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const responses = await Promise.all(Object.values(Sport).map((sport) => getCheer(sport)));

      const newCheers: Record<Sport, Cheer | null> = {
        [Sport.FOOTBALL]: responses[0]?.data || null,
        [Sport.BASKETBALL]: responses[1]?.data || null,
        [Sport.BASEBALL]: responses[2]?.data || null,
        [Sport.RUGBY]: responses[3]?.data || null,
        [Sport.ICE_HOCKEY]: responses[4]?.data || null,
      };

      setCheers(newCheers);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async (sport: Sport) => {
    try {
      const response = await resetCheer(sport);
      setCheers((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    cheers,
    error,
    refetch: fetchAll,
    handleReset,
  };
}
