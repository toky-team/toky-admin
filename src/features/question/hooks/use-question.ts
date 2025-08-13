import { useEffect, useState } from 'react';

import { getQuestion, updateQuestion } from '~/features/question/service/question-service';
import type { Question } from '~/features/question/types/question';
import { Sport } from '~/shared/types/sport';

export function useQuestion() {
  const [questions, setQuestions] = useState<Record<Sport, Question | null>>({
    [Sport.FOOTBALL]: null,
    [Sport.BASKETBALL]: null,
    [Sport.BASEBALL]: null,
    [Sport.RUGBY]: null,
    [Sport.ICE_HOCKEY]: null,
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const responses = await Promise.all(Object.values(Sport).map((sport) => getQuestion(sport)));

      const newQuestions: Record<Sport, Question | null> = {
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
  }, []);

  const handleUpdate = async (sport: Sport, question: string, positionFilter: string | null) => {
    try {
      const response = await updateQuestion(sport, question, positionFilter);
      setQuestions((prev) => {
        return {
          ...prev,
          [sport]: response.data,
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
