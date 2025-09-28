import type { University } from '~/shared/types/university';

export interface RaffleResult {
  drawId: string;
  userId: string;
  username: string;
  phoneNumber: string;
  university: University;
}
