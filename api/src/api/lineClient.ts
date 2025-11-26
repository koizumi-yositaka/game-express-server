export type TLineMessage = {
  userId: string;
  messages: any[];
};

const LINE_LAMBDA_ENDPOINT = process.env.LINE_LAMBDA_ENDPOINT ?? "";

export const lineClient = {
  sendMessage: async (userId: string, messages: any[]) => {
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
