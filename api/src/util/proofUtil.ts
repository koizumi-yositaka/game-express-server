import {
  DEFAULT_PROOF_COUNT,
  PROOF_BOMB_RESERVED_WORD,
  PROOF_RANK,
  PROOF_STATUS,
} from "../domain/proof/proofCommon";
import {
  ProofRoomSessionSettingJsonContents,
  ProofForm,
  TProofRoomMember,
  TProofRoomSession,
} from "../domain/proof/types";
import { TProofRole } from "../domain/proof/types";
import { gameUtil } from "./gameUtil";

export const proofUtil = {
  assignRoles: (
    roomMembers: TProofRoomMember[],
    roles: TProofRole[]
  ): TProofRoomMember[] => {
    const shuffledRoles = gameUtil.shuffleArray(roles);
    const resultMembers: TProofRoomMember[] =
      gameUtil.shuffleArray(roomMembers);

    // TODO
    for (let i = 0; i < resultMembers.length; i++) {
      resultMembers[i].roleId = shuffledRoles[i].roleId;
      resultMembers[i].role = shuffledRoles[i];
    }
    return resultMembers;
  },
  createGameSetting: async (): Promise<ProofRoomSessionSettingJsonContents> => {
    return {
      aCount: DEFAULT_PROOF_COUNT.A_NORMAL,
      aDummyCount: DEFAULT_PROOF_COUNT.A_DUMMY,
      bCount: DEFAULT_PROOF_COUNT.B_NORMAL,
      bDummyCount: DEFAULT_PROOF_COUNT.B_DUMMY,
      cCount: DEFAULT_PROOF_COUNT.C_NORMAL,
      cDummyCount: DEFAULT_PROOF_COUNT.C_DUMMY,
      featureB: {
        DETECTIVE: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
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
        LIER: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        INFORMER: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
        MAGICIAN: {
          borned: "",
          favariteFood: "",
          birthDay: "",
          yesterday: "",
        },
      },
    };
  },

  createProofs: async (
    setting: ProofRoomSessionSettingJsonContents,
    proofRoomSession: TProofRoomSession
  ): Promise<ProofForm[]> => {
    // A:8 B:14 C:18

    const codeAList = gameUtil.shuffleArray(createCodeList(PROOF_RANK.A));
    const codeBList = gameUtil.shuffleArray(createCodeList(PROOF_RANK.B));
    const codeCList = gameUtil.shuffleArray(createCodeList(PROOF_RANK.C));

    const result: ProofForm[] = [];

    result.push(...createProofList(proofRoomSession, codeAList, PROOF_RANK.A));
    result.push(...createProofList(proofRoomSession, codeBList, PROOF_RANK.B));
    result.push(...createProofList(proofRoomSession, codeCList, PROOF_RANK.C));

    return result;
  },
};
function createCodeList(rank: string) {
  let totalCount = 0;
  const result: string[] = [];
  switch (rank) {
    case PROOF_RANK.A:
      totalCount = DEFAULT_PROOF_COUNT.A_NORMAL + DEFAULT_PROOF_COUNT.A_DUMMY;
      break;
    case PROOF_RANK.B:
      totalCount = DEFAULT_PROOF_COUNT.B_NORMAL + DEFAULT_PROOF_COUNT.B_DUMMY;
      break;
    case PROOF_RANK.C:
      totalCount = DEFAULT_PROOF_COUNT.C_NORMAL + DEFAULT_PROOF_COUNT.C_DUMMY;
      break;
  }
  for (let i = 0; i < totalCount; i++) {
    result.push(rank + String(i + 1));
  }
  return result;
}

function createProofList(
  proofRoomSession: TProofRoomSession,
  codeList: string[],
  rank: keyof typeof PROOF_RANK
) {
  let result: ProofForm[] = [];
  switch (rank) {
    case PROOF_RANK.A:
      result = _createAProofList(proofRoomSession, codeList);
      break;
    case PROOF_RANK.B:
      result = _createBProofList(proofRoomSession, codeList);
      break;
    case PROOF_RANK.C:
      result = _createCProofList(proofRoomSession, codeList);
      break;
  }

  return result;
}

function _createAProofList(
  proofRoomSession: TProofRoomSession,
  codeList: string[]
) {
  const result: ProofForm[] = [];
  const normalCount = DEFAULT_PROOF_COUNT.A_NORMAL;
  const dummyCount = DEFAULT_PROOF_COUNT.A_DUMMY;

  console.log(proofRoomSession.room.members);

  const memberInfos = proofRoomSession.room.members.map(getMemberInfoString);

  if (codeList.length !== normalCount + dummyCount) {
    throw new Error(
      "Code list length is not equal to normal count + dummy count"
    );
  }

  for (let i = 0; i < codeList.length; i++) {
    if (i === 0) {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.A,
        status: PROOF_STATUS.NORMAL,
        title: PROOF_BOMB_RESERVED_WORD,
        description: "Proof" + i,
      });
      continue;
    }
    if (i < normalCount) {
      console.log("memberInfos[i - 1]", i, memberInfos[i - 1]);

      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.A,
        status: PROOF_STATUS.NORMAL,
        title: memberInfos[i - 1].sentence,
        description: memberInfos[i - 1].memberId,
      });
    } else {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.A,
        status: PROOF_STATUS.DUMMY,
        title: PROOF_RANK.A + codeList[i],
        description: "DummyProof" + i,
      });
    }
  }

  return result;
}
function _createBProofList(
  proofRoomSession: TProofRoomSession,
  codeList: string[]
) {
  const result: ProofForm[] = [];
  const normalCount = DEFAULT_PROOF_COUNT.B_NORMAL;
  const dummyCount = DEFAULT_PROOF_COUNT.B_DUMMY;

  if (codeList.length !== normalCount + dummyCount) {
    throw new Error(
      "Code list length is not equal to normal count + dummy count"
    );
  }

  for (let i = 0; i < codeList.length; i++) {
    if (i < normalCount) {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.B,
        status: PROOF_STATUS.NORMAL,
        title: PROOF_RANK.B + codeList[i],
        description: "Proof" + i,
      });
    } else {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.B,
        status: PROOF_STATUS.DUMMY,
        title: PROOF_RANK.B + codeList[i],
        description: "DummyProof" + i,
      });
    }
  }

  return result;
}

function _createCProofList(
  proofRoomSession: TProofRoomSession,
  codeList: string[]
) {
  const result: ProofForm[] = [];
  const normalCount = DEFAULT_PROOF_COUNT.C_NORMAL;
  const dummyCount = DEFAULT_PROOF_COUNT.C_DUMMY;

  if (codeList.length !== normalCount + dummyCount) {
    throw new Error(
      "Code list length is not equal to normal count + dummy count"
    );
  }

  for (let i = 0; i < codeList.length; i++) {
    if (i < normalCount) {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.C,
        status: PROOF_STATUS.NORMAL,
        title: PROOF_RANK.C + codeList[i],
        description: "Proof" + i,
      });
    } else {
      result.push({
        roomSessionId: proofRoomSession.id,
        code: codeList[i],
        rank: PROOF_RANK.C,
        status: PROOF_STATUS.DUMMY,
        title: PROOF_RANK.C + codeList[i],
        description: "DummyProof" + i,
      });
    }
  }

  return result;
}

function getMemberInfoString(member: TProofRoomMember) {
  return {
    sentence: `${member.user?.displayName} は ${member.role?.roleName} です。`,
    memberId: `${member.user?.displayName}の正体`,
  };
}
