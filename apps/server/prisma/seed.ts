import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add any seed data here
  console.log('Seeding database...');
  
  // Example: Create an admin user
  // await prisma.user.create({
  //   data: {
  //     name: 'Admin',
  //     email: 'admin@example.com',
  //     password: 'changeme123', // Remember to hash this in production
  //   },
  // });
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
