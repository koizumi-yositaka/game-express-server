import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      roleId: 0,
      roleName: "NONE",
      priority: 0,
      description: "None",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/none.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/none",
      group: 1,
    },
    {
      roleId: 1,
      roleName: "EMPEROR",
      priority: 0,
      description: "皇帝",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/emperor.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/emperor",
      group: 1,
    },
    {
      roleId: 2,
      roleName: "DEATH",
      priority: 0,
      description: "死神",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/death.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/death",
      group: 2,
    },
    {
      roleId: 3,
      roleName: "HIEROPHANT",
      priority: 10,
      description: "祭司 次のターン誰かの行動を阻害する",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/hierophant.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/hierophant",
      group: 1,
    },
    {
      roleId: 3,
      roleName: "FOOL",
      priority: 0,
      description: "愚者",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/fool.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/fool",
      group: 1,
    },
    {
      roleId: 5,
      roleName: "THE_TOWER",
      priority: 0,
      description: "塔",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/tower.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/tower",
      group: 3,
    },
    {
      roleId: 6,
      roleName: "SUN",
      priority: 0,
      description: "太陽",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/sun.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/sun",
      group: 1,
    },
    {
      roleId: 7,
      roleName: "MOON",
      priority: 0,
      description: "月",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/moon.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/moon",
      group: 1,
    },
  ];

  for (const r of roles) {
    await prisma.mRole.upsert({
      where: { roleId: r.roleId },
      update: {
        roleName: r.roleName,
        priority: r.priority,
        description: r.description,
        imageUrl: r.imageUrl,
        notionUrl: r.notionUrl,
        group: r.group,
      },
      create: r,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
