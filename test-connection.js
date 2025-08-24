const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'apps/server/.env.production' });

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test the connection with a simple query
    const result = await prisma.$queryRaw`SELECT version() as version, current_database() as db, current_user as user`;
    console.log('✅ Database connection successful!');
    console.log('📊 Database Info:', result[0]);
    
    // List all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tables in the database:');
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

main().catch(console.error);
