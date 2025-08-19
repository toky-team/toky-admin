import type { Sport } from '~/shared/types/sport';

export interface LiveUrl {
  id: string;
  sport: Sport;
  broadcastName: string;
  url: string;
}
