import { lineClient } from "../api/lineClient";
import { InternalServerError } from "../error/AppError";
import { CommandButtonData } from "./gameUtil";
import { MESSAGE_TEMPLATE } from "./messageTemplate";

const getSimpleTextMessage = (text: string) => {
  return {
    type: "text",
    text,
  };
};

const getFlexMessage = (template: any) => {
  return {
    type: "flex",
    altText: "Flex Message",
    contents: template,
  };
};

export const lineUtil = {
  // game開始時のrole告知用のmessage
  sendNoticeRoleMessage: async (
    userId: string,
    title: string,
    description: string,
    imageUrl: string,
    linkUrl: string,
    linkLabel: string
  ) => {
    try {
      const headerMessage = getSimpleTextMessage(
        MESSAGE_TEMPLATE.NOTICE_ROLE_HEADER
      );
      const template = structuredClone(MESSAGE_TEMPLATE.NOTICE_ROLE) as any;
      template.body.contents[0].text = title;
      template.body.contents[1].contents[0].contents[1].text = description;
      template.body.contents[2].url = imageUrl;
      template.footer.contents[0].action.uri = linkUrl;
      template.footer.contents[0].action.label = linkLabel;
      await lineClient.sendMessage(userId, [
        headerMessage,
        getFlexMessage(template),
      ]);
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error,
      };
    }
  },

  // 実行可能なコマンドの選択肢を送信する
  sendAvailableCommandsMessage: async (
    userId: string,
    commandButtonDataList: CommandButtonData[]
  ) => {
    try {
      const template = MESSAGE_TEMPLATE.AVAILABLE_COMMANDS as any;
      template.body.contents[1].contents = commandButtonDataList.map(
        (commandButtonData) => {
          const commandButton = structuredClone(
            MESSAGE_TEMPLATE.POSTBACK_COMMAND_BUTTON
          );
          const dataString = `action=${commandButtonData.action}&formId=${commandButtonData.formId}&roomSessionId=${commandButtonData.roomSessionId}&memberId=${commandButtonData.memberId}&commandType=${commandButtonData.commandType}&turn=${commandButtonData.turn}`;
          commandButton.action.label = commandButtonData.label;
          commandButton.action.displayText = commandButtonData.displayText;
          commandButton.action.data = dataString;
          return commandButton;
        }
      );
      await lineClient.sendMessage(userId, [getFlexMessage(template)]);
    } catch (error) {
      throw new InternalServerError(
        "Failed to send available commands message"
      );
    }
  },
};
