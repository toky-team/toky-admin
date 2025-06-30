import type { MatchStatus } from '~/features/score/types/match-status';
import type { Sport } from '~/shared/types/sport';

export interface Score {
  sport: Sport;
  KUScore: number;
  YUScore: number;
  matchStatus: MatchStatus;
}
