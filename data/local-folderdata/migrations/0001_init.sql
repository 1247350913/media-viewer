PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS libraries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  root_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY,
  library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abs_path TEXT NOT NULL UNIQUE,
  mtime_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

CREATE TABLE IF NOT EXISTS titles (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,
  parent_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_name TEXT,
  year INTEGER,
  part_number INTEGER,
  season_number INTEGER,
  episode_number INTEGER,
  quality TEXT,
  meta_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now')),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now'))
);
CREATE INDEX IF NOT EXISTS idx_titles_parent_kind ON titles(parent_id, kind);

CREATE TABLE IF NOT EXISTS title_folders (
  title_id INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'primary',
  PRIMARY KEY (title_id, folder_id)
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY,
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  title_id INTEGER REFERENCES titles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  abs_path TEXT NOT NULL UNIQUE,
  ext TEXT,
  role TEXT NOT NULL,
  size_bytes INTEGER,
  mtime_ms INTEGER NOT NULL,
  hash TEXT,
  meta_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_files_folder_role ON files(folder_id, role);
