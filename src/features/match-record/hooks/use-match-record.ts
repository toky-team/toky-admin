import { useEffect, useState } from 'react';

import { getMatchRecords, putMatchRecords, setLeagueImage } from '~/features/match-record/service/match-record-service';
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

  const handleSetLeagueImage = async (sport: Sport, league: string, image: File | null) => {
    try {
      const response = await setLeagueImage(sport, league, image);
      // 해당 스포츠의 기존 레코드에서 리그에 맞는 레코드의 이미지를 업데이트
      setRecords((prev) => ({
        ...prev,
        [sport]: prev[sport].map((record) =>
          record.league === league ? { ...record, imageUrl: response.data.imageUrl } : record
        ),
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
    handleSetLeagueImage,
  };
}
