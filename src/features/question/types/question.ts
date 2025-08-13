import type { Sport } from '~/shared/types/sport';

export interface Question {
  sport: Sport;
  question: string;
  positionFilter: string | null;
}
