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
