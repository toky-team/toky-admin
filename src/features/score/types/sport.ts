export const Sport = {
  FOOTBALL: '축구',
  BASKETBALL: '농구',
  BASEBALL: '야구',
  RUGBY: '럭비',
  ICE_HOCKEY: '아이스하키',
} as const;

export type Sport = (typeof Sport)[keyof typeof Sport];
