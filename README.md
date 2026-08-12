# FitnessQuest BED CA2

FitnessQuest is a gamified fitness web app built for `ST0503: Back-End Web Development CA2`.
It uses Express, MySQL, JWT authentication, and vanilla HTML/CSS/JavaScript.

Project context:

- Student: Goh Kun Ming
- Module: ST0503 Back-End Web Development
- Lecturer: Lecturer Junie Tan
- Course: Diploma in Applied AI and Analytics
- Academic period: AY2024/2025 Semester 2

## Evidence and interpretation

| Evidence-backed measure | Current repository evidence                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Executable test suite   | **6 API tests, 3 security tests, and 6 browser tests** cover desktop and mobile flows against MySQL 8.4. |
| Dependency gate         | The current lockfile resolves to **0 npm audit vulnerabilities** after non-breaking transitive updates.  |

The qualitative outcome is a tested Express/MySQL/JWT fitness application with validation, rate limiting, security headers, and end-to-end user journeys. Test coverage is evidence of exercised controls, not a guarantee that the application is vulnerability-free.

## Features

- Secure registration and login with bcrypt password hashing and JWT auth.
- Authenticated profile, leaderboard, challenges, reviews, pets, inventory, enemies, battles, quests, and achievements.
- User-scoped routes that ignore client-supplied `user_id` for protected actions.
- Zod request validation, Helmet security headers, rate limiting, and safe error handling.
- Responsive frontend using safe DOM rendering helpers instead of HTML string injection.
- Jest/Supertest API tests, security regression tests, Playwright E2E tests, and GitHub Actions CI.

## Tech Stack

- Node.js 22+
- Express 5
- MySQL 8
- mysql2 promise API
- bcrypt
- jsonwebtoken
- Zod
- Jest, Supertest, Playwright, ESLint, Prettier

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`.

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your MySQL credentials.

4. Create and seed the database.

   ```bash
   npm run db:reset
   ```

5. Start the app.

   ```bash
   npm start
   ```

6. Open `http://localhost:3000`.

Seed users use the password `password123`.

## Scripts

- `npm start` - start the production-style Express server.
- `npm run dev` - start with nodemon.
- `npm run db:create` - create the configured database.
- `npm run db:migrate` - recreate tables from `src/db/schema.sql`.
- `npm run db:seed` - insert seed data from `src/db/seed.sql`.
- `npm run db:reset` - create, migrate, and seed the configured database.
- `npm test` - reset the test database and run Jest tests.
- `npm run test:security` - run security regression tests.
- `npm run test:e2e` - run Playwright browser tests.
- `npm run lint` - run ESLint.
- `npm run format` - check Prettier formatting.
- `npm run audit` - run production dependency audit.
- `npm run check` - run the full local verification suite.

## Project Structure

```text
src/
  config/          validated environment configuration
  db/              schema, seed, and promise-based MySQL helpers
  middleware/      auth, validation, and error handling
  modules/         feature routes for auth, users, game systems
  utils/           shared server helpers
public/
  css/             responsive app styling
  js/shared/       browser API and DOM helpers
  js/pages/        page-specific controllers
tests/
  api/             API integration tests
  security/        security regression tests
  e2e/             Playwright browser tests
docs/
  coursework/      submitted coursework artifacts
```

## Security Notes

- Do not commit `.env` or real secrets.
- Public demo endpoints for raw JWT/bcrypt helpers were removed.
- Runtime DB access disables `multipleStatements`.
- Protected actions derive ownership from the JWT, not request body or URL `user_id`.
- Frontend scripts render untrusted data through `textContent` and created text nodes.

## Coursework Artifacts

Coursework submission files are stored in `docs/coursework/` for traceability. They are not part of
the MIT source-code license unless explicitly stated by their original owners.

## GitHub Metadata

Suggested repository name: `fitness-quest-bed-ca2`

Suggested description:

```text
FitnessQuest: an Express, MySQL, and vanilla JS gamified fitness app for ST0503 Back-End Web Development CA2.
```

Suggested topics:

```text
nodejs, express, mysql, jwt-auth, playwright, backend-web-development, st0503,
singapore-polytechnic, coursework, fitness-game
```

## License

Source code is released under the MIT License. School logos, coursework documents, media, and
third-party assets remain owned by their respective rights holders.
