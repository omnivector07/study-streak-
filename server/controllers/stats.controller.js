const userModel = require('../models/user.model');
const sessionModel = require('../models/session.model');

/**
 * GET /stats
 * Returns aggregate statistics for the statistics page.
 */
async function getStats(request, reply) {
  const user = await userModel.getUser();
  if (!user) {
    return reply.code(404).send({ error: 'User not found. Please create a user first.' });
  }

  const sessions = await sessionModel.getCompletedSessions();
  const uniqueDaysStudied = new Set(sessions.map((s) => s.date)).size;

  const averageMinutesPerDay = uniqueDaysStudied > 0
    ? Math.round(user.totalMinutes / uniqueDaysStudied)
    : 0;

  return reply.send({
    totalMinutes: user.totalMinutes,
    totalSessions: user.totalSessions,
    averageMinutesPerDay,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak
  });
}

module.exports = { getStats };
