import type { MatchResult } from '~/shared/types/match-result';
import type { Sport } from '~/shared/types/sport';

export interface Question {
  sport: Sport;
  question: string;
  positionFilter: string | null;
  answer: {
    predict: {
      matchResult: MatchResult;
      score: {
        kuScore: number;
        yuScore: number;
      };
    };
    kuPlayer: {
      playerId: string[];
    };
    yuPlayer: {
      playerId: string[];
    };
  } | null;
}
