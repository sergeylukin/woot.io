// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { links } from "../data/links";
const prisma = new PrismaClient();

async function main() {
  const databaseIsEmpty = (await prisma.user.count()) === 0;
  if (!databaseIsEmpty) return;
  await prisma.user.create({
    data: {
      email: `testemail@gmail.com`,
      role: "ADMIN",
    },
  });

  await prisma.link.createMany({
    data: links,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
