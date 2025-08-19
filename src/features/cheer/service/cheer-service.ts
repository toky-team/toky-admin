import type { Cheer } from '~/features/cheer/types/cheer';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getCheer = async (sport: Sport) => {
  return await api.get<Cheer>('/cheer', {
    params: { sport },
  });
};

export const resetCheer = async (sport: Sport) => {
  return await api.post<Cheer>(
    `/admin/cheer/reset`,
    {},
    {
      params: { sport },
    }
  );
};
