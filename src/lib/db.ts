import { resolve, sep } from "path";
import Database from "better-sqlite3";

function validateDatabasePath(dbPath: string): void {
  if (dbPath === ":memory:") return;

  const resolved = resolve(dbPath);
  const projectRoot = resolve(".");

  if (!resolved.startsWith(projectRoot + sep) && resolved !== projectRoot) {
    throw new Error("Invalid database path: must be within the project directory");
  }
}

const DATABASE_PATH = process.env.DATABASE_PATH ?? "./data/v0x.db";
validateDatabasePath(DATABASE_PATH);

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DATABASE_PATH);
    db.pragma("journal_mode = WAL");
  }
  return db;
}

function initDb(): void {
  const conn = getDb();
  conn.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function addToWaitlist(email: string): { added: boolean } {
  initDb();
  const conn = getDb();
  const result = conn
    .prepare("INSERT OR IGNORE INTO waitlist (email) VALUES (?)")
    .run(email);
  return { added: result.changes > 0 };
}
