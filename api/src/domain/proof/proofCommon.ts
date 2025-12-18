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
  A_DUMMY: 1,
  B_DUMMY: 2,
  C_DUMMY: 0,
  C_MAP: {
    type1: 1,
    type2: 1,
    type3: 1,
    type4: 1,
    type5: 1,
    type6: 1,
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
  SWITCHER: "SWITCHER",
  FIVE: "FIVE",
  SIX: "SIX",
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
  [PROOF_ROLE_NAME_MAP.SWITCHER]: {
    name: "スイッチャー",
    description: "スイッチャーは、証拠を交換することができます。",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/switcher.png",
    skillLimit: 0,
  },
  [PROOF_ROLE_NAME_MAP.FIVE]: {
    name: "ファイブ",
    description: "ファイブは、証拠を交換することができます。",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/five.png",
    skillLimit: 0,
  },
  [PROOF_ROLE_NAME_MAP.SIX]: {
    name: "シックス",
    description: "シックスは、証拠を交換することができます。",
    imageUrl: "https://d1z1o17j25srna.cloudfront.net/six.png",
    skillLimit: 0,
  },
});

export const PROOF_ROLE_GROUP_MAP = Object.freeze({
  ONE: 1,
  TWO: 2,
});

export const PROOF_ADMIN_USER_ID = "admin";
