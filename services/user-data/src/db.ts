import { Pool } from 'pg';
import { ENV } from './env';

export const pool = new Pool({ connectionString: ENV.DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
