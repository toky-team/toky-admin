import type { Question } from '~/features/question/types/question';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getQuestion = async (sport: Sport) => {
  return await api.get<Question[]>('/bet-question', {
    params: { sport },
  });
};

export const updateQuestion = async (questionId: string, question: string, options: string[]) => {
  return await api.patch<Question>('/admin/bet-question', {
    questionId,
    question,
    options,
  });
};
