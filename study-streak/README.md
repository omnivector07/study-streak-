# Study Streak (MVP)

Helps university students build a daily study habit for exams, CAs, and quizzes
through consistency instead of cramming.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000**.

That's it — no database setup required. Data is persisted to `data/db.json`,
which is created automatically on first run.

## Tech stack

- **Backend:** Fastify + `@fastify/static`
- **Frontend:** Plain HTML/CSS/JavaScript (no frameworks)
- **Storage:** a single JSON file (`data/db.json`), accessed only through
  `server/models/*`. This was chosen over SQLite so the project runs with
  `npm install` on any machine with zero native build tooling. Because all
  reads/writes go through the model layer, swapping in SQLite/Postgres later
  only means rewriting `db.js`, `user.model.js`, and `session.model.js` —
  routes and controllers don't change.

## Project structure

```
/server
  /routes        -> thin route -> controller wiring
  /controllers   -> business logic (validation, streak math, aggregation)
  /models        -> data access (db.json read/write)
  /utils         -> date helpers, motivational messages
  config.js      -> app constants (daily goal minutes)
  app.js         -> Fastify instance factory
/public
  /css/style.css
  /js/app.js     -> SPA logic: onboarding, tabs, API calls, rendering
  index.html
data/db.json     -> created automatically at runtime
index.js         -> server entry point
```

## REST API

| Method | Path            | Description                                      |
|--------|-----------------|---------------------------------------------------|
| GET    | `/user`         | Returns the current user, or 404 before onboarding |
| POST   | `/user`         | Creates the user (first-use name entry)           |
| GET    | `/dashboard`    | Streaks, totals, and today's goal progress        |
| POST   | `/study/start`  | Starts a session: `{ course, topic, duration }`   |
| POST   | `/study/finish` | Completes a session: `{ sessionId, actualDuration? }` |
| GET    | `/history`      | All completed sessions, most recent first          |
| GET    | `/stats`        | Aggregate statistics                               |

## Streak logic

- Completing at least one session on a given day counts that day toward the streak.
- If the last studied day was yesterday, the streak increments by 1.
- If a day was missed, the streak resets to 1 on the next completed session.
- `longestStreak` is updated whenever `currentStreak` exceeds it.

## Daily goal

Default goal is **60 minutes/day** (see `server/config.js`). The dashboard shows
progress as `X / 60 minutes` and displays "Daily Goal Achieved 🎉" once met.

## Not in this MVP (intentionally)

Mentioned only as future improvements, not implemented: AI study coach,
flashcards, quiz generator, PDF uploads, timetable, notifications, friends
leaderboard, badges.
