import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const url = process.env.DATABASE_URL!;
const migrationsDir = path.join(process.cwd(), 'migrations');

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamp NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await client.query(`SELECT name FROM _migrations ORDER BY id`);
  const applied = new Set(rows.map(r => r.name as string));

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  try {
    await client.query('BEGIN');
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file} ...`);
      await client.query(sql);
      await client.query('INSERT INTO _migrations(name) VALUES ($1)', [file]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
  console.log('Done.');
}
main();
