import crypto from "crypto";
const SECRET_PASSWORD =
  process.env.SECRET_PASSWORD ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const myUtil = {
  getRandomInt: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  encrypt: async (text: string) => {
    const key = await deriveKey(SECRET_PASSWORD);

    // 12 バイトのランダム IV（GCM 推奨サイズ）
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // iv, authTag, encrypted を結合して base64 で返す
    const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64");
    return payload;
  },
  decrypt: async (payloadBase64: string) => {
    const key = await deriveKey(SECRET_PASSWORD);

    const payload = Buffer.from(payloadBase64, "base64");

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

    return decrypted.toString("utf8");
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
      "1987-03-12",
      "1995-07-28",
      "2001-11-04",
      "1992-02-19",
      "1984-09-30",
      "1999-05-21",
      "2003-01-08",
      "1990-12-14",
      "1988-06-03",
      "1997-10-26",
      "1983-04-17",
      "2000-08-09",
      "1994-03-25",
      "1986-11-18",
      "1993-07-02",
      "2002-09-27",
      "1996-05-15",
      "1989-01-31",
      "1991-10-07",
      "1985-06-29",
      "2004-02-12",
      "1998-12-01",
      "1993-08-11",
      "1987-04-06",
      "2001-09-22",
      "1995-03-18",
      "1982-07-05",
      "1999-11-29",
      "1990-01-20",
      "1984-10-13",
      "1997-02-08",
      "2003-06-25",
      "1996-09-14",
      "1989-12-28",
      "1992-08-03",
      "2000-04-19",
      "1985-02-27",
      "1998-07-09",
      "1994-11-30",
      "2002-03-16",
      "1986-09-24",
      "1988-05-10",
      "1991-12-22",
      "1999-02-14",
      "1983-08-20",
      "2004-10-05",
      "1996-01-27",
      "1993-06-12",
      "1987-11-30",
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
