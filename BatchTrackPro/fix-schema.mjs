import postgres from 'postgres';

// Use Neon database configuration
let databaseUrl = process.env.DATABASE_URL;
if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  const pgHost = process.env.PGHOST;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;
  const pgPort = process.env.PGPORT || '5432';
  databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
}

const sql = postgres(databaseUrl);

console.log('Fixing database schema...');

try {
  // Fix the external_id column to allow longer values
  await sql`ALTER TABLE batch_items ALTER COLUMN external_id TYPE TEXT`;
  console.log('Fixed external_id column to TEXT type');
} catch (error) {
  console.error('Error fixing schema:', error);
} finally {
  await sql.end();
}