import type { Sport } from '~/shared/types/sport';

export interface Question {
  id: string;
  sport: Sport;
  order: number;
  question: string;
  options: string[];
  optionsCount: number;
}
