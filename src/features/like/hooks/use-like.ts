import { useEffect, useState } from 'react';

import { getLike, resetLike } from '~/features/like/service/like-service';
import type { Like } from '~/features/like/types/like';
import { Sport } from '~/shared/types/sport';

export function useLike() {
  const [likes, setLikes] = useState<Record<Sport, Like | null>>({
    [Sport.FOOTBALL]: null,
    [Sport.BASKETBALL]: null,
    [Sport.BASEBALL]: null,
    [Sport.RUGBY]: null,
    [Sport.ICE_HOCKEY]: null,
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const responses = await Promise.all(Object.values(Sport).map((sport) => getLike(sport)));

      const newLikes: Record<Sport, Like | null> = {
        [Sport.FOOTBALL]: responses[0]?.data || null,
        [Sport.BASKETBALL]: responses[1]?.data || null,
        [Sport.BASEBALL]: responses[2]?.data || null,
        [Sport.RUGBY]: responses[3]?.data || null,
        [Sport.ICE_HOCKEY]: responses[4]?.data || null,
      };

      setLikes(newLikes);
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
      const response = await resetLike(sport);
      setLikes((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    likes,
    error,
    refetch: fetchAll,
    handleReset,
  };
}
