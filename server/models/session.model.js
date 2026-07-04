const { readDb, writeDb } = require('./db');

/**
 * Creates a new study session record (starts out as not completed).
 */
async function createSession(session) {
  const db = await readDb();
  const nextId = db.sessions.length
    ? Math.max(...db.sessions.map((s) => s.id)) + 1
    : 1;

  const newSession = { id: nextId, ...session };
  db.sessions.push(newSession);
  await writeDb(db);
  return newSession;
}

/**
 * Finds a single session by id.
 */
async function findSessionById(id) {
  const db = await readDb();
  return db.sessions.find((s) => s.id === id) || null;
}

/**
 * Applies a partial update to an existing session (e.g. marking it complete).
 */
async function updateSession(id, updates) {
  const db = await readDb();
  const index = db.sessions.findIndex((s) => s.id === id);
  if (index === -1) {
    throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  }
  db.sessions[index] = { ...db.sessions[index], ...updates };
  await writeDb(db);
  return db.sessions[index];
}

/**
 * Returns every session, completed or not.
 */
async function getAllSessions() {
  const db = await readDb();
  return db.sessions;
}

/**
 * Returns only completed sessions - used for history, stats, and streak/goal math.
 */
async function getCompletedSessions() {
  const db = await readDb();
  return db.sessions.filter((s) => s.completed);
}

module.exports = {
  createSession,
  findSessionById,
  updateSession,
  getAllSessions,
  getCompletedSessions
};
