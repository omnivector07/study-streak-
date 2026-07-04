const userModel = require('../models/user.model');
const sessionModel = require('../models/session.model');
const { todayStr, yesterdayStr } = require('../utils/date');
const { getRandomMessage } = require('../utils/messages');

/**
 * POST /study/start
 * Begins a new study session. Duration is the *planned* length; it may be
 * overridden with the actual time spent when the session is finished.
 */
async function startSession(request, reply) {
  const { course, topic, duration } = request.body || {};

  if (!course || typeof course !== 'string' || !course.trim()) {
    return reply.code(400).send({ error: 'Course name is required' });
  }
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return reply.code(400).send({ error: 'Topic is required' });
  }

  const plannedDuration = Number(duration);
  if (!plannedDuration || plannedDuration <= 0) {
    return reply.code(400).send({ error: 'Planned duration must be a positive number of minutes' });
  }

  const user = await userModel.getUser();
  if (!user) {
    return reply.code(404).send({ error: 'User not found. Please create a user first.' });
  }

  const session = await sessionModel.createSession({
    course: course.trim(),
    topic: topic.trim(),
    duration: plannedDuration,
    completed: false,
    date: todayStr(),
    createdAt: new Date().toISOString()
  });

  return reply.code(201).send(session);
}

/**
 * POST /study/finish
 * Marks a session complete, adds its minutes to the user's totals, and
 * updates the streak. Streak rules:
 *  - First completed session of a new day where yesterday was also studied -> streak +1
 *  - First completed session of a new day where yesterday was missed -> streak resets to 1
 *  - Additional sessions on a day that's already counted -> streak unchanged
 * Longest streak is updated whenever the current streak exceeds it.
 */
async function finishSession(request, reply) {
  const { sessionId, actualDuration } = request.body || {};

  if (!sessionId) {
    return reply.code(400).send({ error: 'sessionId is required' });
  }

  const session = await sessionModel.findSessionById(Number(sessionId));
  if (!session) {
    return reply.code(404).send({ error: 'Session not found' });
  }
  if (session.completed) {
    return reply.code(400).send({ error: 'Session is already completed' });
  }

  const finalDuration = Number(actualDuration) > 0 ? Number(actualDuration) : session.duration;

  const updatedSession = await sessionModel.updateSession(session.id, {
    completed: true,
    duration: finalDuration
  });

  const user = await userModel.getUser();
  const today = todayStr();
  const yesterday = yesterdayStr();

  let { currentStreak, longestStreak, lastStudyDate } = user;

  // Only recompute the streak the first time today's goal-eligible session lands
  if (lastStudyDate !== today) {
    currentStreak = lastStudyDate === yesterday ? currentStreak + 1 : 1;
    lastStudyDate = today;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  const updatedUser = await userModel.updateUser({
    currentStreak,
    longestStreak,
    lastStudyDate,
    totalMinutes: user.totalMinutes + finalDuration,
    totalSessions: user.totalSessions + 1
  });

  return reply.send({
    session: updatedSession,
    user: updatedUser,
    message: getRandomMessage()
  });
}

module.exports = { startSession, finishSession };
