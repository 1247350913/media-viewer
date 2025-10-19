import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const url = process.env.DATABASE_URL!;
const seedFile = path.join(process.cwd(), 'seeds', 'dev_user.sql');

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const sql = fs.readFileSync(seedFile, 'utf8');
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Seeded dev user.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
}
main();
