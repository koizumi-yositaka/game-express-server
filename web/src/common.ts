export const GAME_STATUS = Object.freeze({
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED_GOAL: 2,
  COMPLETED_NOT_GOAL: 3,
});

export const ROOM_MEMBER_STATUS = Object.freeze({
  ACTIVE: 0,
  SKILL_USED: 1,
  BLOCKED: 2,
});

export const ROLE_GROUP_MAP = Object.freeze({
  KINGDOM: 1,
  HELL: 2,
  TOWER: 3,
});

export const ROLE_NAME_MAP = {
  EMPEROR: "EMPEROR",
  DEATH: "DEATH",
  HIEROPHANT: "HIEROPHANT",
  FOOL: "FOOL",
  THE_TOWER: "THE_TOWER",
  SUN: "SUN",
  MOON: "MOON",
};

export const GAME_RESULT_MAP = Object.freeze({
  KINGDOM_WIN: 1,
  HELL_WIN: 2,
  TOWER_WIN: 3,
});
