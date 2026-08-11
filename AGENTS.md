# Repository agent instructions

## Scope and precedence

These instructions apply to the entire repository. If a future directory contains a more specific `AGENTS.md`, follow that file for work inside its directory. Direct maintainer instructions take precedence.

## Project context

- **Project:** FitnessQuest BED CA2
- **Repository shape:** Node.js
- Read `README.md` before changing behaviour, architecture, data handling, or public claims.
- Treat `CONTRIBUTING.md` as the authoritative development workflow and command reference.
- Follow `SECURITY.md` for vulnerability reporting and `CODE_OF_CONDUCT.md` for collaboration.
- Use the workflows under `.github/workflows/` as the final cross-platform CI contract.

## Working agreement

1. Keep each change focused on a clear problem; avoid unrelated cleanup.
2. Inspect nearby tests, configuration, documentation, and generated artifacts before editing.
3. Add or update tests for behavioural changes, including failure and boundary cases.
4. Preserve public APIs and file formats unless the change explicitly includes a documented migration.
5. Never commit credentials, personal data, local environments, caches, or unlicensed datasets.
6. Do not weaken lint, coverage, security, or dependency gates merely to obtain a passing run.
7. After code or architecture changes, run `graphify update .` and review the graph diff; do not commit cache-only churn.
8. Do not stage, commit, push, or publish changes unless the maintainer explicitly requests that action.

## Required validation

Run commands from the repository root. Use a clean environment when dependency or packaging behaviour changes.

### Standard development gate

```text
npm ci
npm run lint
npm run format
npm run test
npm run test:security
npm run test:e2e
npm run audit
```

### Repository-specific CI-equivalent checks

```text
# No additional repository-specific command beyond the development gate above.
```

Also run `git diff --check`. Record exactly which commands ran, their outcomes, and any documented prerequisite that prevented a check. Do not describe an unexecuted check as passing.

### Conditional or integration setup

- Create `.env` from `.env.example`, point it at a disposable MySQL 8 database, and run `npm run db:reset` before local application or integration testing.
- Install Playwright's browser runtime before E2E tests when it is not already available.

## Managed artifacts and data

- Treat `src/db/schema.sql` and `src/db/seed.sql` as database sources; local databases, logs, coverage, and Playwright reports are runtime outputs.
- Do not commit `.env` or real credentials.

## Integration and claim boundaries

- The test command resets the configured test database; never point tests at a personal, shared, or production database.
- Unit, security, and browser suites require a disposable MySQL service; the audit's disposable database was removed afterward.
- The repository has no Dockerfile or Compose manifest, so do not add a generic container guardrail.
- **Verified local capability:** 9 unit, 3 security, and 6 Playwright tests against disposable MySQL.
- **Known boundary:** The disposable database was removed after validation.

## Code, documentation, and evidence standards

- For JavaScript or TypeScript, follow the repository's ESLint and Prettier configuration and avoid untyped or silently coerced inputs.
- Prefer small, typed, testable units and explicit error handling. Avoid silent fallbacks that hide invalid data, missing models, credentials, or services.
- Update README, architecture, data/model documentation, examples, and changelog material when interfaces or behaviour change.
- Every quantitative claim must retain its denominator, dataset/version, split, date range, run/configuration, and calculation method.
- Distinguish measured results from targets, examples, heuristics, previews, and prior runs. Do not infer deployment, accuracy, security, causality, or impact from tests or scaffolding alone.
- Update generated files through their source script. If no generator exists, document the manual process and verify semantic equivalence.

## Review and handoff

Before handing off a change, provide a concise summary, list changed files, report validation evidence, and call out residual risks or unavailable integrations. Keep commits imperative and scoped; do not add tool-attribution or automated co-author trailers.
