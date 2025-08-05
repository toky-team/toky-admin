import { useEffect, useState } from 'react';

import { getMatchRecords, putMatchRecords } from '~/features/match-record/service/match-record-service';
import type { MatchRecord } from '~/features/match-record/types/match-record';
import { Sport } from '~/shared/types/sport';

export function useMatchRecord() {
  const [records, setRecords] = useState<Record<Sport, MatchRecord[]>>({
    [Sport.FOOTBALL]: [],
    [Sport.BASKETBALL]: [],
    [Sport.BASEBALL]: [],
    [Sport.RUGBY]: [],
    [Sport.ICE_HOCKEY]: [],
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAllBySport = async (sport: Sport) => {
    try {
      const response = await getMatchRecords(sport);
      setRecords((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    Object.values(Sport).forEach((sport) => {
      fetchAllBySport(sport);
    });
  }, []);

  const handleUpdate = async (sport: Sport, matchRecords: MatchRecord[]) => {
    try {
      const response = await putMatchRecords(sport, matchRecords);
      setRecords((prev) => ({
        ...prev,
        [sport]: response.data,
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    records,
    error,
    refetch: fetchAllBySport,
    handleUpdate,
  };
}
