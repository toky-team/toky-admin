import type { Score } from '~/features/score/types/score';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getScore = async (sport: Sport) => {
  return await api.get<Score>('/score', {
    params: { sport },
  });
};

export const startMatch = async (sport: Sport) => {
  return await api.post<Score>(
    '/admin/score/start',
    {},
    {
      params: { sport },
    }
  );
};

export const endMatch = async (sport: Sport) => {
  return await api.post<Score>(
    '/admin/score/end',
    {},
    {
      params: { sport },
    }
  );
};

export const resetMatch = async (sport: Sport) => {
  return await api.post<Score>(
    '/admin/score/reset',
    {},
    {
      params: { sport },
    }
  );
};

export const updateScore = async (sport: Sport, KUSCore: number, YUSCore: number) => {
  return await api.post<Score>(
    '/admin/score/update',
    {
      kuScore: KUSCore,
      yuScore: YUSCore,
    },
    {
      params: { sport },
    }
  );
};
