import { useEffect, useState } from 'react';

import { getQuestion, updateQuestion } from '~/features/question/service/question-service';
import type { Question } from '~/features/question/types/question';
import { Sport } from '~/shared/types/sport';

export function useQuestion() {
  const [questions, setQuestions] = useState<Record<Sport, Question[]>>({
    [Sport.FOOTBALL]: [],
    [Sport.BASKETBALL]: [],
    [Sport.BASEBALL]: [],
    [Sport.RUGBY]: [],
    [Sport.ICE_HOCKEY]: [],
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const responses = await Promise.all(Object.values(Sport).map((sport) => getQuestion(sport)));

      const newQuestions: Record<Sport, Question[]> = {
        [Sport.FOOTBALL]: responses[0].data,
        [Sport.BASKETBALL]: responses[1].data,
        [Sport.BASEBALL]: responses[2].data,
        [Sport.RUGBY]: responses[3].data,
        [Sport.ICE_HOCKEY]: responses[4].data,
      };
      setQuestions(newQuestions);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async (questionId: string, question: string, options: string[]) => {
    try {
      const response = await updateQuestion(questionId, question, options);
      setQuestions((prev) => {
        const sport = response.data.sport;
        return {
          ...prev,
          [sport]: prev[sport].map((q) => (q.id === questionId ? response.data : q)),
        };
      });
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    questions,
    error,
    refetch: fetchAll,
    handleUpdate,
  };
}
