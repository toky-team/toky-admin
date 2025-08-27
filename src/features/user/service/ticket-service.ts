import api from '~/shared/lib/api';

export const incrementTicket = async (userId: string, count: number, reason: string) => {
  return await api.post<void>(`/admin/ticket/increment`, {
    userId,
    count,
    reason,
  });
};
