import type { Sport } from '~/shared/types/sport';
import type { University } from '~/shared/types/university';

export interface MatchRecordParams {
  sport: Sport;
  league: string;
  universityStats: {
    university: University;
    stats: Record<string, string>;
  }[];
  playerStatsWithCategory: {
    category: string;
    players: {
      name: string;
      university: University;
      position: string | null;
      stats: Record<string, string>;
    }[];
  }[];
}
