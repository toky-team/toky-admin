import type { University } from '~/shared/types/university';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  university: University;
  createdAt: string;
}
