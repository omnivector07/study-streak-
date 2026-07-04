const { readDb, writeDb } = require('./db');

/**
 * Returns the single app user, or null if onboarding hasn't happened yet.
 * (MVP is single-user by design - no auth/multi-tenancy needed yet.)
 */
async function getUser() {
  const db = await readDb();
  return db.user;
}

/**
 * Creates the user record on first launch.
 */
async function createUser(name) {
  const db = await readDb();
  db.user = {
    id: 1,
    name,
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    totalSessions: 0,
    lastStudyDate: null // 'YYYY-MM-DD' of the last day with a completed session
  };
  await writeDb(db);
  return db.user;
}

/**
 * Applies a partial update to the user record (e.g. after finishing a session).
 */
async function updateUser(updates) {
  const db = await readDb();
  if (!db.user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }
  db.user = { ...db.user, ...updates };
  await writeDb(db);
  return db.user;
}

module.exports = { getUser, createUser, updateUser };
