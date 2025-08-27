import type { Sport } from '~/shared/types/sport';
import type { University } from '~/shared/types/university';

export interface Player {
  id: string;
  name: string;
  university: University;
  sport: Sport;
  department: string;
  birth: string;
  height: number;
  weight: number;
  position: string;
  backNumber: number;
  careers: string[];
  imageUrl: string;
  likeCount: number;
  isPrimary: boolean;
}
