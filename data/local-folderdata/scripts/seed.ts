import 'dotenv/config';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.SQLITE_DB_PATH || './vault.sqlite';
const seedFile = path.join(process.cwd(), 'seeds', 'sample_movies.sql');

const db = new Database(dbPath);
const sql = fs.readFileSync(seedFile, 'utf8');
db.exec('BEGIN IMMEDIATE;');
db.exec(sql);
db.exec('COMMIT;');
console.log('Seeded sample movies.');
db.close();
