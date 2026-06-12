# Architecture

FitnessQuest uses a conventional layered Express structure.

- `src/app.js` configures middleware, security headers, rate limiting, static assets, and routes.
- `src/config/env.js` validates environment variables at startup.
- `src/db/pool.js` exposes the MySQL promise pool and transaction helper.
- `src/modules/*/routes.js` owns feature routes and domain logic.
- `src/middleware/auth.js` verifies JWTs and loads the safe current user.
- `src/middleware/validate.js` validates request data with Zod.
- `public/js/shared` contains safe browser API and DOM helpers.
- `public/js/pages` contains page-specific UI controllers.

Runtime database queries use placeholders and `multipleStatements: false`. The reset/migration
script is separate from the runtime app and executes schema statements one at a time.
