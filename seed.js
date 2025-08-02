const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: 'user_1', // Replace with a unique ID
      clerkUserId: 'clerk_user_1', // Replace with the Clerk user ID you are using
      email: 'user@example.com',
      name: 'Test User',
      imageUrl: 'https://example.com/image.png',
    },
  });

  console.log('User created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });