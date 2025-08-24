const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:VkjMJB/Ue&!245@@db.utkzgdftoqawbtsrkpjo.supabase.co:5432/postgres?sslmode=require'
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

async function checkConnection() {
  try {
    console.log('🔌 Connecting to the database...');
    await prisma.$connect();
    
    // Check database version
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    console.log('✅ Database connection successful!');
    console.log('📊 Database Info:', result[0]);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in the database:');
    console.table(tables);
    
    // Check if User table exists and count records
    try {
      const userCount = await prisma.user.count();
      console.log(`\n👥 Found ${userCount} users in the database.`);
    } catch (e) {
      console.log('\n❌ Error counting users. The User table might not exist or have a different structure.');
      console.error(e.message);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

checkConnection();
