// Study Streak - frontend logic
// Talks to the REST API and renders the single-page app.
// No frameworks: plain DOM manipulation + fetch.

const API = {
  getUser: () => fetch('/user').then(parseJson),
  createUser: (name) =>
    fetch('/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(parseJson),
  getDashboard: () => fetch('/dashboard').then(parseJson),
  startSession: (payload) =>
    fetch('/study/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(parseJson),
  finishSession: (payload) =>
    fetch('/study/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(parseJson),
  getHistory: () => fetch('/history').then(parseJson),
  getStats: () => fetch('/stats').then(parseJson)
};

// Wraps fetch responses so non-2xx codes reject with the server's error message.
async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

const ACTIVE_SESSION_KEY = 'studyStreak.activeSessionId';

/* -----------------------------------------------------------
   Boot: decide whether to show onboarding or the main app
   ----------------------------------------------------------- */
async function boot() {
  try {
    await API.getUser();
    showApp();
    initTabs();
    await refreshAll();
    restoreActiveSessionUI();
  } catch (err) {
    showOnboarding();
  }
}

function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

document.getElementById('onboarding-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('onboarding-name');
  const errorEl = document.getElementById('onboarding-error');
  errorEl.classList.add('hidden');

  try {
    const user = await API.createUser(nameInput.value.trim());
    showApp();
    initTabs();
    await refreshAll();
    document.getElementById('greeting-name').textContent = user.name;
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

/* -----------------------------------------------------------
   Tab navigation
   ----------------------------------------------------------- */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.tab === tabName)
  );
  document.querySelectorAll('.tab-panel').forEach((p) =>
    p.classList.toggle('active', p.id === `tab-${tabName}`)
  );

  // Lazily refresh data relevant to the tab being opened
  if (tabName === 'history') loadHistory();
  if (tabName === 'stats') loadStats();
  if (tabName === 'dashboard') loadDashboard();
}

/* -----------------------------------------------------------
   Dashboard
   ----------------------------------------------------------- */
async function loadDashboard() {
  const data = await API.getDashboard();

  document.getElementById('greeting-name').textContent = data.user.name;
  document.getElementById('current-streak').textContent = data.user.currentStreak;
  document.getElementById('longest-streak').textContent = data.user.longestStreak;
  document.getElementById('total-sessions').textContent = data.user.totalSessions;
  document.getElementById('total-minutes').textContent = data.user.totalMinutes;

  const { target, progress, achieved } = data.dailyGoal;
  const pct = Math.min(100, Math.round((progress / target) * 100));

  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('progress-current').textContent = progress;
  document.getElementById('progress-target').textContent = target;

  document.getElementById('goal-check').classList.toggle('hidden', !achieved);
  document.getElementById('goal-achieved-msg').classList.toggle('hidden', !achieved);
}

/* -----------------------------------------------------------
   Study session (start / finish)
   ----------------------------------------------------------- */
document.getElementById('start-session-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('study-error');

  const course = document.getElementById('course').value.trim();
  const topic = document.getElementById('topic').value.trim();
  const duration = Number(document.getElementById('planned-duration').value);

  try {
    const session = await API.startSession({ course, topic, duration });
    localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
    showActiveSession(session);
    e.target.reset();
  } catch (err) {
    showError('study-error', err.message);
  }
});

document.getElementById('finish-session-btn').addEventListener('click', async () => {
  hideError('study-error');
  const sessionId = localStorage.getItem(ACTIVE_SESSION_KEY);
  const actualDuration = Number(document.getElementById('actual-duration').value) || undefined;

  try {
    const result = await API.finishSession({ sessionId, actualDuration });
    localStorage.removeItem(ACTIVE_SESSION_KEY);

    hideActiveSession();
    showMotivation(result.message);
    await loadDashboard();
  } catch (err) {
    showError('study-error', err.message);
  }
});

function showActiveSession(session) {
  document.getElementById('start-session-card').classList.add('hidden');
  document.getElementById('motivation-card').classList.add('hidden');

  document.getElementById('active-course').textContent = session.course;
  document.getElementById('active-topic').textContent = session.topic;
  document.getElementById('active-planned').textContent = session.duration;
  document.getElementById('actual-duration').value = session.duration;

  document.getElementById('active-session-card').classList.remove('hidden');
}

function hideActiveSession() {
  document.getElementById('active-session-card').classList.add('hidden');
  document.getElementById('start-session-card').classList.remove('hidden');
}

function showMotivation(message) {
  document.getElementById('motivation-text').textContent = message;
  document.getElementById('motivation-card').classList.remove('hidden');
}

// If the page was reloaded mid-session, restore the "in progress" UI.
function restoreActiveSessionUI() {
  const sessionId = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!sessionId) return;

  // We don't have a GET /study/:id endpoint in this MVP, so we just
  // restore a minimal active-session view using generic placeholders.
  document.getElementById('start-session-card').classList.add('hidden');
  document.getElementById('active-session-card').classList.remove('hidden');
  document.getElementById('active-course').textContent = 'Session in progress';
  document.getElementById('active-topic').textContent = 'Finish it below when you\u2019re done.';
}

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}
function hideError(id) {
  document.getElementById(id).classList.add('hidden');
}

/* -----------------------------------------------------------
   History
   ----------------------------------------------------------- */
async function loadHistory() {
  const sessions = await API.getHistory();
  const container = document.getElementById('history-list');

  if (!sessions.length) {
    container.innerHTML = '<p class="muted">No sessions yet. Start one from the Study tab!</p>';
    return;
  }

  container.innerHTML = sessions
    .map(
      (s) => `
      <div class="history-item">
        <div class="history-main">
          <div class="history-course">${escapeHtml(s.course)}</div>
          <div class="history-topic">${escapeHtml(s.topic)}</div>
          <div class="history-date">${s.date}</div>
        </div>
        <div class="history-minutes">${s.duration} min</div>
      </div>`
    )
    .join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* -----------------------------------------------------------
   Stats
   ----------------------------------------------------------- */
async function loadStats() {
  const stats = await API.getStats();
  document.getElementById('stats-total-minutes').textContent = stats.totalMinutes;
  document.getElementById('stats-total-sessions').textContent = stats.totalSessions;
  document.getElementById('stats-avg-minutes').textContent = stats.averageMinutesPerDay;
  document.getElementById('stats-current-streak').textContent = stats.currentStreak;
  document.getElementById('stats-longest-streak').textContent = stats.longestStreak;
}

async function refreshAll() {
  await loadDashboard();
}

boot();

/* -----------------------------------------------------------
   FUTURE IMPROVEMENTS (not implemented in this MVP):
   - AI study coach suggestions
   - Flashcards
   - Quiz generator
   - PDF uploads for course material
   - Timetable / scheduling
   - Push notifications / reminders
   - Friends leaderboard
   - Badges / achievements
   ----------------------------------------------------------- */
