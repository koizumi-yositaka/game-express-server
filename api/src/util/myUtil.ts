import crypto from "crypto";
import zlib from "zlib";
import { promisify } from "util";

const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const SECRET_PASSWORD =
  process.env.SECRET_PASSWORD ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const myUtil = {
  shuffleArray: <T>(array: T[]): T[] => {
    const arr = [...array]; // 元の配列を破壊しない
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // 0〜i のランダムな整数
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }
    console.log("shuffledArray", arr);
    return arr;
  },

  getRandomInt: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  encrypt: async (text: string) => {
    const key = await deriveKey(SECRET_PASSWORD);

    // テキストを圧縮
    const compressed = await deflate(Buffer.from(text, "utf8"));

    // 12 バイトのランダム IV（GCM 推奨サイズ）
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      cipher.update(compressed),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // iv, authTag, encrypted を結合して base64url で返す（URLセーフ）
    // + を - に、/ を _ に置き換え、パディングの = を削除
    const base64 = Buffer.concat([iv, authTag, encrypted]).toString("base64");
    const base64url = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    return base64url;
  },
  decrypt: async (payloadBase64: string) => {
    const key = await deriveKey(SECRET_PASSWORD);

    // base64url を base64 に変換（- を + に、_ を / に戻す）
    // パディングを補正（base64文字列は4の倍数の長さである必要がある）
    let base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (base64.length % 4)) % 4;
    base64 = base64 + "=".repeat(padding);

    const payload = Buffer.from(base64, "base64");

    // 先頭 12 バイト: IV
    const iv = payload.subarray(0, 12);
    // 次の 16 バイト: authTag
    const authTag = payload.subarray(12, 28);
    // 残り: 暗号文
    const encrypted = payload.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    // 圧縮されたデータを展開
    const decompressed = await inflate(decrypted);

    return decompressed.toString("utf8");
  },
  conbination: <T>(array: T[], size: number): T[] => {
    const result = [];
    const arr = [...array];
    for (let i = 0; i < size; i++) {
      const idx = Math.floor(Math.random() * arr.length);
      result.push(arr[idx]);
      arr.splice(idx, 1);
    }
    return result;
  },
  getNationNames: () => {
    return [
      "日本",
      "アメリカ",
      "イギリス",
      "フランス",
      "ドイツ",
      "イタリア",
      "スペイン",
      "ポーランド",
      "ロシア",
      "カナダ",
      "オーストラリア",
      "ニュージーランド",
      "インド",
      "パキスタン",
      "ブラジル",
      "アラブ",
      "イラン",
    ];
  },
  getFoodNames: () => {
    return [
      // フルーツ
      "りんご",
      "バナナ",
      "みかん",
      "いちご",
      "ぶどう",
      "メロン",
      "スイカ",
      "桃",
      "パイナップル",
      "キウイ",

      // 和食
      "寿司",
      "ラーメン",
      "そば",
      "うどん",
      "おにぎり",
      "天ぷら",
      "焼き魚",
      "味噌汁",
      "焼き鳥",
      "牛丼",
      "親子丼",
      "唐揚げ",
      "たこ焼き",
      "お好み焼き",
      "カレーライス",

      // 洋食
      "ピザ",
      "パスタ",
      "ハンバーガー",
      "ステーキ",
      "サンドイッチ",
      "グラタン",
      "オムライス",
      "ドリア",
      "ホットドッグ",
      "ローストチキン",

      // スイーツ
      "チョコレート",
      "アイスクリーム",
      "ケーキ",
      "プリン",
      "ドーナツ",
      "クッキー",
      "たい焼き",
      "大福",
      "団子",
      "パンケーキ",

      // 飲み物（おまけ）
      "コーヒー",
      "紅茶",
      "抹茶",
      "オレンジジュース",
      "コーラ",
    ];
  },
  getBirthDay: () => {
    return [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
  },
  getYesterday: () => {
    return [
      "朝散歩した",
      "本を読んだ",
      "映画を見た",
      "料理をした",
      "買い物をした",
      "掃除をした",
      "洗濯をした",
      "昼寝をした",
      "音楽を聴いた",
      "勉強をした",
      "仕事をした",
      "散歩に行った",
      "友達と話した",
      "コーヒー飲んだ",
      "動画を見た",
      "ゲームした",
      "手紙を書いた",
      "メモを整理",
      "部屋を片付け",
      "夕食を作った",
      "SNSを見た",
      "早起きした",
      "買い出しした",
      "外食をした",
      "散髪に行った",
      "買い物メモ作成",
      "駅まで歩いた",
      "音楽を作った",
      "メール返信した",
      "日記を書いた",
      "走ってきた",
      "犬を散歩した",
      "買物に出た",
      "少し昼寝した",
      "部屋の模様替え",
      "スーパー行った",
      "洗い物をした",
      "植物に水やり",
      "映画館へ行った",
      "少し運動した",
      "気晴らし外出",
      "写真を撮った",
      "買った本読んだ",
      "料理動画見た",
      "書類整理した",
      "散歩コース変更",
      "ストレッチした",
      "早めに就寝した",
    ];
  },
};

// 鍵長 32 バイト（256 bit）
async function deriveKey(password: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, "salt", 32, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}
