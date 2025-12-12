export const PROOF_ROOM_STATUS = Object.freeze({
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
});

export const PROOF_ROOM_SESSION_STATUS = Object.freeze({
  GAME_STARTED: 0,
  TURN_STARTED: 1,
  ORDER_WAITING: 2,
  ORDER_COMPLETED: 3,
  TURN_ENDED: 4,
});
export const PROOF_STATUS = Object.freeze({
  NORMAL: "1",
  DUMMY: "2",
  BOMBED: "3",
  REVEALED_TO_ONE: "4",
  REVEALED_TO_ALL: "5",
});

export const PROOF_STATUS_MAP = Object.freeze({
  NORMAL: "未開封",
  DUMMY: "ダミー",
  BOMBED: "爆弾",
  REVEALED_TO_ONE: "知らない人がいる",
  REVEALED_TO_ALL: "全体に公開済み",
});

export const PROOF_RANK = Object.freeze({
  A: "A",
  B: "B",
  C: "C",
});

export const DEFAULT_PROOF_COUNT = Object.freeze({
  A_NORMAL: 7,
  B_NORMAL: 12,
  C_NORMAL: 15,
  A_DUMMY: 1,
  B_DUMMY: 2,
  C_DUMMY: 3,
});

export const PROOF_MEMBER_STATUS = Object.freeze({
  ENTERED: 0,
  ASSIGNED: 1,
  APPLY_CARD: 2,
  BOMBED: 99,
});

export const PROOF_PENALTY_MAP = Object.freeze({
  LIE: "1",
});

export const PROOF_BOMB_RESERVED_WORD = "BOMB";

export const PROOF_ROLE_NAME_MAP = Object.freeze({
  DETECTIVE: "DETECTIVE",
  BOMBER: "BOMBER",
  BOMB_SQUAD: "BOMB_SQUAD",
  LIER: "LIER",
  INFORMER: "INFORMER",
  MAGICIAN: "MAGICIAN",
});

export const PROOF_ROLE_GROUP_MAP = Object.freeze({
  ONE: 1,
  TWO: 2,
});

export const REVEALED_RESULT_CODE = Object.freeze({
  SUCCESS: "SUCCESS",
  DISARM_SUCCESS: "DISARM_SUCCESS",
  ALREADY_REVEALED: "ALREADY_REVEALED",
  BOMBED: "BOMBED",
  INVALID_CODE: "INVALID_CODE",
});

export const PROOF_ADMIN_USER_ID = "admin";
