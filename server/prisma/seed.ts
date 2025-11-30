import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();
console.log("here");
async function main() {
  console.log(`Start seeding ...`);

  // Delete all existing roles to ensure a clean slate on each seed run
  await prisma.role.deleteMany();

  // Create the 'user' and 'admin' roles
  const rolesData = [
    { name: 'user' },
    { name: 'admin' },
  ];

  await prisma.role.createMany({
    data: rolesData,
    skipDuplicates: true, // This is an optional flag to prevent errors if you accidentally run it without deleting first
  });

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });