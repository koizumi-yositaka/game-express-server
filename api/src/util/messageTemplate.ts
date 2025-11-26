export const MESSAGE_TEMPLATE = {
  NOTICE_ROLE_HEADER: "Gameが始まりました。\nあなたは以下の役割です。",
  NOTICE_ROLE: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Brown Cafe",
          weight: "bold",
          size: "xl",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "Place",
                  color: "#aaaaaa",
                  size: "sm",
                  flex: 1,
                },
                {
                  type: "text",
                  text: "Flex Tower, 7-7-4 Midori-ku, Tokyo",
                  wrap: true,
                  color: "#666666",
                  size: "sm",
                  flex: 5,
                },
              ],
            },
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "Time",
                  color: "#aaaaaa",
                  size: "sm",
                  flex: 1,
                },
                {
                  type: "text",
                  text: "10:00 - 23:00",
                  wrap: true,
                  color: "#666666",
                  size: "sm",
                  flex: 5,
                },
              ],
            },
          ],
        },
        {
          type: "image",
          url: "https://d1z1o17j25srna.cloudfront.net/fox.png",
          size: "full",
          offsetTop: "none",
          offsetBottom: "none",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "link",
          height: "sm",
          action: {
            type: "uri",
            label: "CALL",
            uri: "https://line.me/",
          },
        },
      ],
      flex: 0,
    },
  },
};
