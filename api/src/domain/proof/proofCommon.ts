export const PROOF_STATUS = Object.freeze({
  NORMAL: "1",
  DUMMY: "2",
  BOMBED: "3",
  REVEALED_TO_ONE: "4",
  REVEALED_TO_ALL: "5",
});

export const PROOF_RANK = Object.freeze({
  A: "A",
  B: "B",
  C: "C",
});

export const DEFAULT_PROOF_COUNT = Object.freeze({
  A_NORMAL: 7,
  B_NORMAL: 10,
  C_NORMAL: 12,
  A_DUMMY: 1,
  B_DUMMY: 4,
  C_DUMMY: 6,
});

export const PROOF_MEMBER_STATUS = Object.freeze({
  ENTERED: 0,
  ASSIGNED: 1,
  APPLY_CARD: 2,
  BOMBED: 99,
});

export const PROOF_BOMB_RESERVED_WORD = "BOMB";

export const PROOF_ROLE_NAME_MAP = {
  DETECTIVE: "DETECTIVE",
  BOMBER: "BOMBER",
  BOMB_SQUAD: "BOMB_SQUAD",
  LIER: "LIER",
  INFORMER: "INFORMER",
  MAGICIAN: "MAGICIAN",
};

export const PROOF_ROLE_GROUP_MAP = Object.freeze({
  ONE: 1,
  TWO: 2,
});
