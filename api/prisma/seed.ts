import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      roleId: 0,
      roleName: "狐",
      priority: 1,
      description: "狐の役割",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/fox.png",
    },
    {
      roleId: 1,
      roleName: "狼",
      priority: 1,
      description: "狼の役割",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/wolf.png",
    },
    {
      roleId: 2,
      roleName: "ハグマン",
      priority: 0,
      description: "ハグマンの役割",
      imageUrl: "https://d1z1o17j25srna.cloudfront.net/haguman.png",
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
