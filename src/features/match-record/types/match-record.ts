import type { Sport } from '~/shared/types/sport';
import type { University } from '~/shared/types/university';

export interface MatchRecord {
  sport: Sport;
  league: string;
  universityStatKeys: string[];
  universityStats: {
    university: University;
    stats: Record<string, string>;
  }[];
  playerStatsWithCategory: {
    category: string;
    playerStatKeys: string[];
    playerStats: {
      playerId: string | null;
      name: string;
      university: University;
      position: string | null;
      stats: Record<string, string>;
    }[];
  }[];
}
