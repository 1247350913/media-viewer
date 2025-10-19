import 'dotenv/config';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || './vault.sqlite';
const migrationsDir = path.join(process.cwd(), 'migrations');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at INTEGER NOT NULL DEFAULT (unixepoch('now'))
);
`);

const applied = new Set<string>(
  db.prepare('SELECT name FROM _migrations ORDER BY id').all().map((r: any) => r.name)
);

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
const tx = db.transaction((name: string, sql: string) => {
  db.exec(sql);
  db.prepare('INSERT INTO _migrations(name) VALUES (?)').run(name);
});

for (const file of files) {
  if (applied.has(file)) continue;
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  console.log(`Applying ${file} ...`);
  tx(file, sql);
}
console.log('Done.');
db.close();
