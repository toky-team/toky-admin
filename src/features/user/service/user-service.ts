import type { UserSummary } from '~/features/user/types/user-summary';
import api from '~/shared/lib/api';

export const fetchUserSummary = async () => {
  return await api.get<UserSummary>('/admin/user/summary');
};
