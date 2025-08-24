const { PrismaClient } = require('@prisma/client');

// Create a new Prisma client with explicit connection string
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:VkjMJB/Ue&!245@@db.utkzgdftoqawbtsrkpjo.supabase.co:5432/postgres?sslmode=require&connection_limit=1'
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

async function main() {
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
    
    // Try to query the User table if it exists
    try {
      const users = await prisma.user.findMany({
        take: 5,
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
      
      console.log('\n👥 Sample users:');
      console.table(users);
      
      if (users.length === 0) {
        console.log('\nℹ️  No users found. The database might be empty.');
      }
    } catch (e) {
      console.log('\n⚠️  Could not query User table. It might not exist or have a different structure.');
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

main();
