const fs = require('fs').promises;
const path = require('path');

// NOTE ON DATA STORE CHOICE:
// This MVP uses a single JSON file instead of SQLite so it runs anywhere
// with zero native build dependencies (no compiler toolchain needed for
// `npm install`). The model layer below (user.model.js / session.model.js)
// is the only place that knows about this file, so swapping to SQLite or
// Postgres later just means rewriting these two files - routes and
// controllers never touch storage directly.

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

const DEFAULT_DATA = {
  user: null,
  sessions: []
};

/**
 * Creates the data file with default structure if it doesn't exist yet.
 */
async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

/**
 * Reads and parses the entire database file.
 */
async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Persists the given data object to disk.
 */
async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb };
