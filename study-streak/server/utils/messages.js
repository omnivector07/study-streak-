const MESSAGES = [
  'Small progress every day beats last-minute cramming.',
  'You are one study session closer to your dream.',
  'Consistency builds success.',
  'Your future self will thank you.',
  'Discipline today, results tomorrow.',
  'Every focused minute compounds.',
  'You showed up today - that is what matters.',
  'Streaks are built one session at a time.'
];

/**
 * Returns one random motivational message, shown after a session is completed.
 */
function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

module.exports = { getRandomMessage };
