import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";

const dbPath = path.join(app.getPath("userData"), "vault.sqlite");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL"); // or FULL if you want max durability
db.pragma("foreign_keys = ON");
