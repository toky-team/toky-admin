export const University = {
  KOREA_UNIVERSITY: '고려대학교',
  YONSEI_UNIVERSITY: '연세대학교',
} as const;

export type University = (typeof University)[keyof typeof University];
