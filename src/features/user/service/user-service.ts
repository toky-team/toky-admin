import type { User } from '~/features/auth/types/user';
import type { UserSummary } from '~/features/user/types/user-summary';
import api from '~/shared/lib/api';

export const fetchUserSummary = async () => {
  return await api.get<UserSummary>('/admin/user/summary');
};

export const getUsers = async (name?: string) => {
  return await api.get<User[]>('/admin/user', {
    params: {
      name,
    },
  });
};
