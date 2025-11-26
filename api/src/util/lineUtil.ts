import { lineClient } from "../api/lineClient";
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
  sendNoticeRoleMessage: async (
    userId: string,
    title: string,
    place: string,
    time: string,
    imageUrl: string,
    linkUrl: string,
    linkLabel: string
  ) => {
    try {
      const headerMessage = getSimpleTextMessage(
        MESSAGE_TEMPLATE.NOTICE_ROLE_HEADER
      );
      const template = MESSAGE_TEMPLATE.NOTICE_ROLE as any;
      template.body.contents[0].text = title;
      template.body.contents[1].contents[0].contents[1].text = place;
      template.body.contents[1].contents[1].contents[1].text = time;
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
};
