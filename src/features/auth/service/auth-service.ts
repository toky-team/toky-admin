import type { User } from '~/features/auth/types/user';
import api from '~/shared/lib/api';

export const fetchMe = async () => {
  return await api.get<User>('/user');
};
