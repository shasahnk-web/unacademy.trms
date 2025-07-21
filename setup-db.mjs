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

console.log('Creating database tables...');

try {
  await sql`
    CREATE TABLE IF NOT EXISTS batches (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_id VARCHAR(50) UNIQUE NOT NULL,
      batch_name TEXT NOT NULL,
      exam VARCHAR(100),
      starts_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      total_teachers INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      teacher_data JSONB,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS batch_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_id VARCHAR(50) NOT NULL,
      item_type VARCHAR(50) NOT NULL,
      title TEXT,
      item_data JSONB NOT NULL,
      external_id VARCHAR(100),
      live_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS api_responses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_id VARCHAR(50) NOT NULL,
      endpoint VARCHAR(200) NOT NULL,
      response_data JSONB NOT NULL,
      status_code INTEGER NOT NULL,
      response_time_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;

  console.log('Database tables created successfully!');
} catch (error) {
  console.error('Error creating tables:', error);
} finally {
  await sql.end();
}