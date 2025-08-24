const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:VkjMJB/Ue&!245@@db.utkzgdftoqawbtsrkpjo.supabase.co:5432/postgres?sslmode=require'
    }
  }
});

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Successfully connected to the database!');

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\nTables in the database:');
    console.table(tables);
    
    // If no tables, create them
    if (tables.length === 0) {
      console.log('No tables found. Creating tables...');
      await prisma.$executeRaw`
        -- Your SQL schema here
        CREATE TABLE IF NOT EXISTS "User" (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
      `;
      console.log('Tables created successfully!');
    }
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
