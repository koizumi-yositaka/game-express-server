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
  B_NORMAL: 12,
  C_NORMAL: 15,
  A_DUMMY: 1,
  B_DUMMY: 2,
  C_DUMMY: 3,
  C_MAP: {
    type1: 2,
    type2: 2,
    type3: 2,
    type4: 2,
    type5: 2,
    type6: 2,
    type7: 3,
  },
});

export const PROOF_MEMBER_STATUS = Object.freeze({
  ENTERED: 0,
  ASSIGNED: 1,
  APPLY_CARD: 2,
  RETIRED: 99,
});

export const PROOF_PENALTY_MAP = Object.freeze({
  LIE: "1",
});

export const PROOF_BOMB_RESERVED_WORD = "BOMB";

export const PROOF_ROLE_NAME_MAP = Object.freeze({
  BOMBER: "BOMBER",
  BOMB_SQUAD: "BOMB_SQUAD",
  STRENGTH: "STRENGTH",
});

export const PROOF_ROLE_SETTING = Object.freeze({
  [PROOF_ROLE_NAME_MAP.BOMBER]: {
    name: "ボマー",
    description: "ボマーは、証拠を爆破することができます。",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/bomber.png",
    skillLimit: 0,
  },
  [PROOF_ROLE_NAME_MAP.BOMB_SQUAD]: {
    name: "鑑定士",
    description: "鑑定士は、爆弾を解除することができます。",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/bomber.png",
    skillLimit: 0,
  },
  [PROOF_ROLE_NAME_MAP.STRENGTH]: {
    name: "力士",
    description: "力士は、爆発に１度耐えることができます",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/bomber.png",
    skillLimit: 1,
  },
});

export const PROOF_ROLE_GROUP_MAP = Object.freeze({
  ONE: 1,
  TWO: 2,
});

export const PROOF_ADMIN_USER_ID = "admin";
