import path from "path";
import { jsonRW } from "../util/jsonRW";

export type TLineMessage = {
  userId: string;
  messages: any[];
};

const LINE_LAMBDA_ENDPOINT = process.env.LINE_LAMBDA_ENDPOINT ?? "";
const dummyFlg = true;

export const lineClient = {
  sendMessage: async (userId: string, messages: any[]) => {
    console.log("sendMessage", userId, messages);
    if (dummyFlg) {
      // dummyFlgがtrueの時は、userIdと同じ名前のファイルにmessagesをJSONで追記
      const filePath = path.join(__dirname, "../data/test", `${userId}.json`);
      try {
        await jsonRW.appendJsonArray(filePath, messages);
        console.log(`Appended messages to ${filePath}`);
      } catch (error) {
        console.error(`Failed to append messages to ${filePath}:`, error);
        throw error;
      }
      return;
    }
    try {
      console.log(`Sending message to ${userId}`, LINE_LAMBDA_ENDPOINT);
      console.dir({ userId, messages }, { depth: null });
      await fetch(`${LINE_LAMBDA_ENDPOINT}push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, messages }),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
