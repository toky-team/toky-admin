import { useEffect, useState } from 'react';

import { endMatch, getScore, resetMatch, startMatch, updateScore } from '~/features/score/service/score-service';
import type { Score } from '~/features/score/types/score';
import { Sport } from '~/shared/types/sport';

export function useScore() {
  const [scores, setScores] = useState<Record<Sport, Score | null>>({
    [Sport.FOOTBALL]: null,
    [Sport.BASKETBALL]: null,
    [Sport.BASEBALL]: null,
    [Sport.RUGBY]: null,
    [Sport.ICE_HOCKEY]: null,
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const responses = await Promise.all(Object.values(Sport).map((sport) => getScore(sport)));

      const newScores: Record<Sport, Score | null> = {
        [Sport.FOOTBALL]: responses[0]?.data || null,
        [Sport.BASKETBALL]: responses[1]?.data || null,
        [Sport.BASEBALL]: responses[2]?.data || null,
        [Sport.RUGBY]: responses[3]?.data || null,
        [Sport.ICE_HOCKEY]: responses[4]?.data || null,
      };

      setScores(newScores);
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

  const handleStart = async (sport: Sport) => {
    try {
      const response = await startMatch(sport);
      setScores((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleEnd = async (sport: Sport) => {
    try {
      const response = await endMatch(sport);
      setScores((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleReset = async (sport: Sport) => {
    try {
      const response = await resetMatch(sport);
      setScores((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleUpdate = async (sport: Sport, KUSCore: number, YUSCore: number) => {
    try {
      const response = await updateScore(sport, KUSCore, YUSCore);
      setScores((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    scores,
    error,
    refetch: fetchAll,
    handleStart,
    handleEnd,
    handleReset,
    handleUpdate,
  };
}
