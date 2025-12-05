import fs from "fs";
import path from "path";

// ファイルパスごとの書き込みキュー（競合を防ぐため）
const writeQueues = new Map<string, Promise<void>>();

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
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(filePath, JSON.stringify(obj, null, 2), (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  },

  // JSON配列に追記（競合を防ぐためキューイング）
  appendJsonArray<T>(filePath: string, items: T[]): Promise<void> {
    // 既存のキューがあれば、その後に実行する
    const previousPromise = writeQueues.get(filePath) || Promise.resolve();

    const newPromise = previousPromise
      .then(async () => {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        let existingArray: T[] = [];
        if (fs.existsSync(filePath)) {
          try {
            const data = fs.readFileSync(filePath, "utf8");
            existingArray = JSON.parse(data) as T[];
            if (!Array.isArray(existingArray)) {
              existingArray = [];
            }
          } catch (e) {
            // ファイルが壊れている場合は空配列から始める
            existingArray = [];
          }
        }

        existingArray.push(...items);

        return new Promise<void>((resolve, reject) => {
          fs.writeFile(
            filePath,
            JSON.stringify(existingArray, null, 2),
            (err) => {
              if (err) {
                writeQueues.delete(filePath);
                return reject(err);
              }
              writeQueues.delete(filePath);
              resolve();
            }
          );
        });
      })
      .catch((err) => {
        writeQueues.delete(filePath);
        throw err;
      });

    writeQueues.set(filePath, newPromise);
    return newPromise;
  },
};
