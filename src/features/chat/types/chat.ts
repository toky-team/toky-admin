import type { Sport } from '~/shared/types/sport';
import type { University } from '~/shared/types/university';

export interface Chat {
  id: string;
  content: string;
  userId: string;
  username: string;
  university: University;
  sport: Sport;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
