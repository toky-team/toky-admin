import type { MatchRecord } from '~/features/match-record/types/match-record';
import type { MatchRecordParams } from '~/features/match-record/types/match-record-params';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getMatchRecords = async (sport: Sport) => {
  return await api.get<MatchRecord[]>('/match-record', {
    params: { sport },
  });
};

export const putMatchRecords = async (sport: Sport, matchRecords: MatchRecord[]) => {
  const recordsParams = matchRecords.map(recordToParams);
  return await api.put<MatchRecord[]>(
    '/admin/match-record',
    {
      records: recordsParams,
    },
    {
      params: { sport },
    }
  );
};

const recordToParams = (record: MatchRecord): MatchRecordParams => {
  return {
    sport: record.sport,
    league: record.league,
    universityStats: record.universityStats.map((stat) => ({
      university: stat.university,
      stats: stat.stats,
    })),
    playerStatsWithCategory: record.playerStatsWithCategory.map((category) => ({
      category: category.category,
      players: category.playerStats.map((player) => ({
        name: player.name,
        university: player.university,
        position: player.position,
        stats: player.stats,
      })),
    })),
  };
};
