import { Pool } from 'pg';

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) throw new Error('POSTGRES_URL is not defined in environment');

interface GlobalWithPool {
  __alignPool?: Pool;
}

const globalWithPool = globalThis as GlobalWithPool;

export const pool: Pool = globalWithPool.__alignPool ?? new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
});

if (!globalWithPool.__alignPool) {
  globalWithPool.__alignPool = pool;
}

export async function ensureWaitlistTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS align_waitlist (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);
}

export async function insertWaitlistEmail(email: string) {
  await ensureWaitlistTable();
  const result = await pool.query(
    `INSERT INTO align_waitlist (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id, email, created_at;`,
    [email]
  );
  return result.rows[0];
}

export async function isDuplicate(email: string) {
  const res = await pool.query('SELECT 1 FROM align_waitlist WHERE email = $1 LIMIT 1', [email]);
  return (res.rowCount ?? 0) > 0;
}
