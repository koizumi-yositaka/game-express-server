import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      roleId: 0,
      roleName: "EMPEROR",
      priority: 1,
      description: "皇帝",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/emperor.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/emperor",
    },
    {
      roleId: 1,
      roleName: "DEATH",
      priority: 1,
      description: "死神",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/death.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/death",
    },
    {
      roleId: 2,
      roleName: "HIEROPHANT",
      priority: 0,
      description: "祭司",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/hierophant.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/hierophant",
    },
    {
      roleId: 3,
      roleName: "FOOL",
      priority: 0,
      description: "愚者",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/fool.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/fool",
    },
    {
      roleId: 4,
      roleName: "HIGH_PRIESTESS",
      priority: 0,
      description: "女教皇",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/highpriestess.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/highpriestess",
    },
    {
      roleId: 5,
      roleName: "HERMIT",
      priority: 0,
      description: "隠者",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/hermit.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/hermit",
    },
    {
      roleId: 6,
      roleName: "THE_TOWER",
      priority: 0,
      description: "塔",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/tower.png",
      notionUrl: "https://flashy-visitor-ec3.notion.site/tower",
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
