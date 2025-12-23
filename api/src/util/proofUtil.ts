import {
  DEFAULT_PROOF_COUNT,
  PROOF_ADMIN_USER_ID,
  PROOF_BOMB_RESERVED_WORD,
  PROOF_RANK,
  PROOF_ROLE_NAME_MAP,
  PROOF_ROLE_SETTING,
  PROOF_STATUS,
} from "../domain/proof/proofCommon";
import {
  ProofRoomSessionSettingJsonContents,
  ProofForm,
  TProofRoomMember,
  TProofRoomSession,
  PROOF_ROLE_FEATURE_B_KEYS,
  RoleFeatureB,
  DecodedUserInfo,
} from "../domain/proof/types";
import { TProofRole } from "../domain/proof/types";

import { gameUtil } from "./gameUtil";
import { myUtil } from "./myUtil";
import { Server } from "socket.io";
import { toDTOProofRoomSession } from "../controllers/proof/dtoParse";
const bomberInfoCardCount = 1;
export const proofUtil = {
  assignRoles: (
    roomMembers: TProofRoomMember[],
    roles: TProofRole[]
  ): TProofRoomMember[] => {
    const shuffledRoles = gameUtil.shuffleArray(roles);
    const ROLE_BOMBER = roles.find(
      (role) => role.roleName === PROOF_ROLE_NAME_MAP.BOMBER
    );
    if (!ROLE_BOMBER) {
      throw new Error("BOMBER role not found");
    }
    const ROLE_BOMB_SQUAD = roles.find(
      (role) => role.roleName === PROOF_ROLE_NAME_MAP.BOMB_SQUAD
    );
    if (!ROLE_BOMB_SQUAD) {
      throw new Error("BOMB_SQUAD role not found");
    }
    const ROLE_STRENGTH = roles.find(
      (role) => role.roleName === PROOF_ROLE_NAME_MAP.STRENGTH
    );
    if (!ROLE_STRENGTH) {
      throw new Error("STRENGTH role not found");
    }

    const resultMembers: TProofRoomMember[] =
      gameUtil.shuffleArray(roomMembers);

    // TODO
    for (let i = 0; i < resultMembers.length; i++) {
      resultMembers[i].roleId = shuffledRoles[i].roleId;
      resultMembers[i].role = shuffledRoles[i];
    }
    return resultMembers;
  },
  createGameSetting: async (
    memberCount: number
  ): Promise<ProofRoomSessionSettingJsonContents> => {
    const featureBKeys = Object.values(PROOF_ROLE_FEATURE_B_KEYS);

    const temp = {
      cardCount: {
        aCount: memberCount + DEFAULT_PROOF_COUNT.A_DUMMY + bomberInfoCardCount, // + 1はbomカード
        aDummyCount: DEFAULT_PROOF_COUNT.A_DUMMY,
        bCount: memberCount * 2 + DEFAULT_PROOF_COUNT.B_DUMMY,
        bDummyCount: DEFAULT_PROOF_COUNT.B_DUMMY,
        cCount:
          Object.values(DEFAULT_PROOF_COUNT.C_MAP).reduce(
            (acc, curr) => (acc += curr),
            0
          ) *
            memberCount +
          DEFAULT_PROOF_COUNT.C_DUMMY,
        cDummyCount: DEFAULT_PROOF_COUNT.C_DUMMY,
      },
      featureB: {
        BOMBER: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        BOMB_SQUAD: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        STRENGTH: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        SWITCHER: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        FIVE: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        SIX: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
      },
      skillDef: {
        BOMBER: {
          skillName: "爆破",
          skillDescription: "ボマーは、証拠を爆破することができます。",
          skillLimit: PROOF_ROLE_SETTING.BOMBER.skillLimit,
        },
        BOMB_SQUAD: {
          skillName: "爆破解除",
          skillDescription: "鑑定士は、爆弾を解除することができます。",
          skillLimit: PROOF_ROLE_SETTING.BOMB_SQUAD.skillLimit,
        },
        STRENGTH: {
          skillName: "耐爆",
          skillDescription: "力士は、爆発に１度耐えることができます",
          skillLimit: PROOF_ROLE_SETTING.STRENGTH.skillLimit,
        },
        SWITCHER: {
          skillName: "証拠交換",
          skillDescription: "スイッチャーは、証拠を交換することができます。",
          skillLimit: PROOF_ROLE_SETTING.SWITCHER.skillLimit,
        },
        FIVE: {
          skillName: "FIVE",
          skillDescription: "??",
          skillLimit: PROOF_ROLE_SETTING.FIVE.skillLimit,
        },
        SIX: {
          skillName: "SIX",
          skillDescription: "??",
          skillLimit: PROOF_ROLE_SETTING.SIX.skillLimit,
        },
      },
    };
    for (const role of Object.values(PROOF_ROLE_NAME_MAP)) {
      const selectedFeatureBKeys = myUtil.conbination(featureBKeys, 2);
      selectedFeatureBKeys.forEach((key) => {
        temp.featureB[role as keyof typeof PROOF_ROLE_NAME_MAP][
          key as keyof RoleFeatureB
        ] = getRandomFeatureB(key as keyof RoleFeatureB);
      });
    }
    console.log("temp", temp);
    return temp;
  },

  createToken: async (userInfo: DecodedUserInfo) => {
    return await myUtil.encrypt(JSON.stringify(userInfo));
  },

  createProofs: async (
    setting: ProofRoomSessionSettingJsonContents,
    proofRoomSession: TProofRoomSession,
    roles: TProofRole[]
  ): Promise<ProofForm[]> => {
    const codeAList = gameUtil.shuffleArray(
      createCodeList(PROOF_RANK.A, setting)
    );
    const codeBList = gameUtil.shuffleArray(
      createCodeList(PROOF_RANK.B, setting)
    );
    const codeCList = gameUtil.shuffleArray(
      createCodeList(PROOF_RANK.C, setting)
    );

    const result: ProofForm[] = [];

    result.push(
      ...createProofList(
        setting,
        proofRoomSession,
        codeAList,
        PROOF_RANK.A,
        roles
      )
    );
    result.push(
      ...createProofList(
        setting,
        proofRoomSession,
        codeBList,
        PROOF_RANK.B,
        roles
      )
    );
    result.push(
      ...createProofList(
        setting,
        proofRoomSession,
        codeCList,
        PROOF_RANK.C,
        roles
      )
    );

    return result;
  },
};
function createCodeList(
  rank: string,
  setting: ProofRoomSessionSettingJsonContents
) {
  let totalCount = 0;
  const result: string[] = [];
  switch (rank) {
    case PROOF_RANK.A:
      totalCount = setting.cardCount.aCount;
      break;
    case PROOF_RANK.B:
      totalCount = setting.cardCount.bCount;
      break;
    case PROOF_RANK.C:
      totalCount = setting.cardCount.cCount;
      break;
  }
  for (let i = 0; i < totalCount; i++) {
    result.push(rank + String(i + 1));
  }
  return result;
}

function createProofList(
  setting: ProofRoomSessionSettingJsonContents,
  proofRoomSession: TProofRoomSession,
  codeList: string[],
  rank: keyof typeof PROOF_RANK,
  roles: TProofRole[]
) {
  let result: ProofForm[] = [];
  switch (rank) {
    case PROOF_RANK.A:
      result = _createAProofList(setting, proofRoomSession, codeList);
      break;
    case PROOF_RANK.B:
      result = _createBProofList(setting, proofRoomSession, codeList, roles);
      break;
    case PROOF_RANK.C:
      console.log("codeList", codeList);
      result = _createCProofList(setting, proofRoomSession, codeList);
      break;
  }

  return result;
}

function _createAProofList(
  setting: ProofRoomSessionSettingJsonContents,
  proofRoomSession: TProofRoomSession,
  codeList: string[]
) {
  const result: ProofForm[] = [];

  const memberInfos = proofRoomSession.room.members.map(getMemberInfoString);
  // 先頭はBomInfo
  for (let i = 0; i < bomberInfoCardCount; i++) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[i],
      rank: PROOF_RANK.A,
      status: PROOF_STATUS.NORMAL,
      title: PROOF_BOMB_RESERVED_WORD,
      description: "不明",
      refer: "",
    });
  }

  for (let i = 0; i < setting.cardCount.aDummyCount; i++) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[bomberInfoCardCount + i],
      rank: PROOF_RANK.A,
      status: PROOF_STATUS.DUMMY,
      title: codeList[bomberInfoCardCount + i],
      description: "DummyProof" + (i + 1),
      refer: "",
    });
  }
  if (
    setting.cardCount.aCount -
      bomberInfoCardCount -
      setting.cardCount.aDummyCount !==
    memberInfos.length
  ) {
    throw new Error("Card count is not equal to member count");
  }
  for (
    let i = 0;
    i <
    setting.cardCount.aCount -
      bomberInfoCardCount -
      setting.cardCount.aDummyCount;
    i++
  ) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[bomberInfoCardCount + setting.cardCount.aDummyCount + i],
      rank: PROOF_RANK.A,
      status: PROOF_STATUS.NORMAL,
      title: memberInfos[i].title,
      description: memberInfos[i].sentence,
      refer: memberInfos[i].refer,
    });
  }
  return result;
}
function _createBProofList(
  setting: ProofRoomSessionSettingJsonContents,
  proofRoomSession: TProofRoomSession,
  codeList: string[],
  roles: TProofRole[]
) {
  const result: ProofForm[] = [];
  const members = proofRoomSession.room.members;

  const featureB = getFeatureB(setting, members, roles);

  for (let i = 0; i < setting.cardCount.bDummyCount; i++) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[i],
      rank: PROOF_RANK.B,
      status: PROOF_STATUS.DUMMY,
      title: codeList[i],
      description: "ごめんなさい、このカードはダミーです",
      refer: "",
    });
  }

  if (
    setting.cardCount.bCount - setting.cardCount.bDummyCount !==
    featureB.length
  ) {
    throw new Error(
      `Card count is not equal to featureB count: ${setting.cardCount.bCount} - ${setting.cardCount.bDummyCount} !== ${featureB.length}`
    );
  }

  for (
    let i = 0;
    i < setting.cardCount.bCount - setting.cardCount.bDummyCount;
    i++
  ) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[i + setting.cardCount.bDummyCount],
      rank: PROOF_RANK.B,
      status: PROOF_STATUS.NORMAL,
      title: featureB[i].title,
      description: featureB[i].description,
      refer: featureB[i].refer,
    });
  }

  return result;
}

function _createCProofList(
  setting: ProofRoomSessionSettingJsonContents,
  proofRoomSession: TProofRoomSession,
  codeList: string[]
) {
  const result: ProofForm[] = [];

  for (let i = 0; i < setting.cardCount.cDummyCount; i++) {
    result.push({
      roomSessionId: proofRoomSession.id,
      code: codeList[i],
      rank: PROOF_RANK.C,
      status: PROOF_STATUS.DUMMY,
      title: codeList[i],
      description: "ごめんなさい、このカードはダミーです",
      refer: "",
    });
  }
  const memberCount = proofRoomSession.room.members.length;
  const cMap = DEFAULT_PROOF_COUNT.C_MAP;
  const cCountWithoutDummy = Object.values(cMap).reduce(
    (acc, curr) => (acc += curr),
    0
  );
  if (cCountWithoutDummy + setting.cardCount.cDummyCount > codeList.length) {
    throw new Error("Code list length is not enough");
  }

  for (let i = 0; i < cCountWithoutDummy - setting.cardCount.cDummyCount; i++) {
    Object.entries(cMap).forEach(([type, count]) => {
      Array.from({ length: memberCount * count }).forEach((_, index) => {
        result.push({
          roomSessionId: proofRoomSession.id,
          code: codeList[setting.cardCount.cDummyCount + i],
          rank: PROOF_RANK.C,
          status: PROOF_STATUS.NORMAL,
          title: PROOF_RANK.C + `${type}${index + 1}`,
          description: `${type}${index + 1}のPOWER`,
          refer: "",
        });
        i++;
      });
    });
    //   if (i < count) {
    //     result.push({
    //       roomSessionId: proofRoomSession.id,
    //       code: codeList[i],
    //       rank: PROOF_RANK.C,
    //       status: PROOF_STATUS.NORMAL,
    //       title: PROOF_RANK.C + codeList[i],
    //       description: "Proof" + i,
    //       refer: "",
    //     });
    //   }
    //   i++;
    // });
    // result.push({
    //   roomSessionId: proofRoomSession.id,
    //   code: codeList[i],
    //   rank: PROOF_RANK.C,
    //   status: PROOF_STATUS.NORMAL,
    //   title: PROOF_RANK.C + codeList[i],
    //   description: "Proof" + i,
    //   refer: "",
    // });
  }

  return result;
}

function getMemberInfoString(member: TProofRoomMember) {
  return {
    refer: createRefer("member", member.id.toString()),
    sentence: `${member.user?.displayName} は ${member.role?.roleName} です。`,
    title: `${member.user?.displayName}の正体`,
  };
}

function getRandomFeatureB(
  featureBKey: (typeof PROOF_ROLE_FEATURE_B_KEYS)[keyof typeof PROOF_ROLE_FEATURE_B_KEYS]
) {
  switch (featureBKey) {
    case PROOF_ROLE_FEATURE_B_KEYS.BORNED:
      return myUtil.getNationNames()[
        myUtil.getRandomInt(0, myUtil.getNationNames().length - 1)
      ];
    case PROOF_ROLE_FEATURE_B_KEYS.FAVARITE_FOOD:
      return myUtil.getFoodNames()[
        myUtil.getRandomInt(0, myUtil.getFoodNames().length - 1)
      ];
    case PROOF_ROLE_FEATURE_B_KEYS.BIRTH_DAY:
      return myUtil.getBirthDay()[
        myUtil.getRandomInt(0, myUtil.getBirthDay().length - 1)
      ];
    case PROOF_ROLE_FEATURE_B_KEYS.YESTERDAY:
      return myUtil.getYesterday()[
        myUtil.getRandomInt(0, myUtil.getYesterday().length - 1)
      ];
  }
}

function getFeatureB(
  setting: ProofRoomSessionSettingJsonContents,
  members: TProofRoomMember[],
  roles: TProofRole[]
) {
  const result = [];

  console.log("setting", setting);
  console.log("members", members);
  // 各メンバーに対して、そのメンバーのロールのfeatureBを2つ生成
  for (const member of members) {
    const roleName = roles.find(
      (role) => role.roleId === member.roleId
    )?.roleName;
    if (!roleName) {
      continue;
    }
    const roleFeatureB =
      setting.featureB[roleName as keyof typeof PROOF_ROLE_NAME_MAP];
    if (!roleFeatureB) {
      continue;
    }
    // 設定されているfeatureBキーを取得（空でないもの）
    const featureBKeys = Object.values(PROOF_ROLE_FEATURE_B_KEYS).filter(
      (key) => roleFeatureB[key as keyof RoleFeatureB]
    );
    // 各メンバーに対して2つのfeatureBを生成
    for (const key of featureBKeys) {
      const featureB = roleFeatureB[key as keyof RoleFeatureB];
      if (featureB) {
        result.push({
          description: `${roleName}の${keyToName(key)}は${featureB}`,
          title: `${roleName}のヒント`,
          refer: createRefer("member", member.id.toString()),
        });
      }
    }
  }
  return result;
}

export const activateUser = (
  io: Server,
  userId: string,
  isActivate: boolean
) => {
  console.log("activateUser", userId, isActivate);
  io.to(`user:${userId}`).emit(
    isActivate ? "order:activate" : "order:deactivate",
    isActivate ? "activate" : "deactivate"
  );
};

export const noticeAllUserInfo = (
  io: Server,
  roomSession: TProofRoomSession
) => {
  io.to(`user:${PROOF_ADMIN_USER_ID}`).emit("order:all", {
    sessionRoom: toDTOProofRoomSession(roomSession),
  });
};

const keyToName = (key: keyof RoleFeatureB) => {
  switch (key) {
    case PROOF_ROLE_FEATURE_B_KEYS.BORNED:
      return "出身国";
    case PROOF_ROLE_FEATURE_B_KEYS.FAVARITE_FOOD:
      return "好きな食べ物";
    case PROOF_ROLE_FEATURE_B_KEYS.BIRTH_DAY:
      return "誕生月";
    case PROOF_ROLE_FEATURE_B_KEYS.YESTERDAY:
      return "昨日の出来事";
  }
};

export const isBomber = (member: TProofRoomMember) => {
  return member.role?.roleName === PROOF_ROLE_NAME_MAP.BOMBER;
};

export const createRefer = (type: "member" | "role", id: string) => {
  return `${type}:${id}`;
};
