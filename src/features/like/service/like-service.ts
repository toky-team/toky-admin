import type { Like } from '~/features/like/types/like';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getLike = async (sport: Sport) => {
  return await api.get<Like>('/like', {
    params: { sport },
  });
};

export const resetLike = async (sport: Sport) => {
  return await api.post<Like>(
    `/admin/like/reset`,
    {},
    {
      params: { sport },
    }
  );
};
