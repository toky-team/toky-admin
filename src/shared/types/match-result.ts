export const MatchResult = {
  KOREA_UNIVERSITY: '고려대학교',
  YONSEI_UNIVERSITY: '연세대학교',
  DRAW: '무승부',
} as const;

export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];
