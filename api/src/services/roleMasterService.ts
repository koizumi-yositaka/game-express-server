import { roleRepository } from "../repos/roleRepository";
import { TRole } from "../domain/types";
import { toTRole } from "./roomService";

// キャッシュ用の変数
let rolesCache: TRole[] | null = null;

export const roleMasterService = {
  /**
   * ロールマスターデータを取得する
   * キャッシュがあればそれを返し、なければDBから取得してキャッシュに保存する
   */
  getRoles: async (): Promise<TRole[]> => {
    // キャッシュがあればそれを返す
    if (rolesCache !== null) {
      return rolesCache;
    }

    // キャッシュがない場合はDBから取得
    const roles = await roleRepository.getRoles();
    rolesCache = roles.map((role) => toTRole(role));

    return rolesCache;
  },

  /**
   * キャッシュをクリアする
   * マスターデータが更新された場合などに使用
   */
  clearCache: (): void => {
    rolesCache = null;
  },
};
