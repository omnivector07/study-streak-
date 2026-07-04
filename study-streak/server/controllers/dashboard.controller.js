const userModel = require('../models/user.model');
const sessionModel = require('../models/session.model');
const { todayStr } = require('../utils/date');
const { DAILY_GOAL_MINUTES } = require('../config');

/**
 * GET /dashboard
 * Returns the user's headline stats plus today's progress toward the daily goal.
 */
async function getDashboard(request, reply) {
  const user = await userModel.getUser();
  if (!user) {
    return reply.code(404).send({ error: 'User not found. Please create a user first.' });
  }

  const completedSessions = await sessionModel.getCompletedSessions();
  const today = todayStr();

  const todayMinutes = completedSessions
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.duration, 0);

  const goalAchieved = todayMinutes >= DAILY_GOAL_MINUTES;

  return reply.send({
    user: {
      name: user.name,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalMinutes: user.totalMinutes,
      totalSessions: user.totalSessions
    },
    dailyGoal: {
      target: DAILY_GOAL_MINUTES,
      progress: todayMinutes,
      achieved: goalAchieved
    }
  });
}

module.exports = { getDashboard };
