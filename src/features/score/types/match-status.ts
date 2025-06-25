export const MatchStatus = {
  NOT_STARTED: '시작 전',
  IN_PROGRESS: '진행 중',
  COMPLETED: '종료',
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];
