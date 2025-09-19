import type { Question } from '~/features/question/types/question';
import api from '~/shared/lib/api';
import type { MatchResult } from '~/shared/types/match-result';
import type { Sport } from '~/shared/types/sport';

export const getQuestion = async (sport: Sport) => {
  return await api.get<Question>('/bet-question', {
    params: { sport },
  });
};

export const getAllQuestions = async () => {
  return await api.get<Question[]>('/bet-question/all');
};

export const updateQuestion = async (sport: Sport, question: string, positionFilter: string | null) => {
  return await api.patch<Question>('/admin/bet-question', {
    sport,
    question,
    positionFilter,
  });
};

export const setAnswer = async (
  sport: Sport,
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
  } | null
) => {
  return await api.patch<Question>('/admin/bet-question/answer', {
    sport,
    answer,
  });
};
