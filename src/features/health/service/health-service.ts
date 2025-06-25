import type { Health } from '~/features/health/types/health';
import api from '~/shared/lib/api';

export const fetchHealth = async () => {
  return await api.get<Health>('/health');
};
