import type { LiveUrl } from '~/features/live-url/types/live-url';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';

export const getLiveUrls = async (sport: Sport) => {
  return await api.get<LiveUrl[]>('/live-url', {
    params: { sport },
  });
};

export const createLiveUrl = async (sport: Sport, broadcastName: string, url: string) => {
  return await api.post<LiveUrl>('/admin/live-url', {
    sport,
    broadcastName,
    url,
  });
};

export const updateLiveUrl = async (id: string, broadcastName?: string, url?: string) => {
  return await api.patch<LiveUrl>(`/admin/live-url/${id}`, {
    broadcastName,
    url,
  });
};

export const deleteLiveUrl = async (id: string) => {
  return await api.delete<LiveUrl>(`/admin/live-url/${id}`);
};
