import prisma from './client';
import bcrypt from 'bcryptjs';

async function main(){

  console.log('Seeding admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@expatdakar.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@expatdakar.com',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Admin user created or updated.');

  // Categories will be created by admin only
  console.log('No default categories seeded - admin must create them manually.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});








