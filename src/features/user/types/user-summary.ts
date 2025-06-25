export interface UserSummary {
  totalUsers: number;
  KUUsers: number;
  YUUsers: number;
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
