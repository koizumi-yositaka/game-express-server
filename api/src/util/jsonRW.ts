import fs from "fs";

export const jsonRW = {
  // JSON読み込み
  readJson<T>(filePath: string): Promise<T> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return reject(err);
        try {
          resolve(JSON.parse(data) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
  },

  // JSON書き込み
  writeJson<T>(filePath: string, obj: T) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFile(filePath, JSON.stringify(obj, null, 2), (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  },
};
