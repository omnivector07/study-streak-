const sessionModel = require('../models/session.model');

/**
 * GET /history
 * Returns all completed sessions, most recent first.
 */
async function getHistory(request, reply) {
  const sessions = await sessionModel.getCompletedSessions();
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return reply.send(sorted);
}

module.exports = { getHistory };
