# Testing

## API and Security Tests

Run:

```bash
npm test
npm run test:security
```

These tests use `fitnessquest_test` by default and reset it before the Jest suite.

## E2E Tests

Run:

```bash
npm run test:e2e
```

Playwright starts the app on port `3010`, resets the test database, and runs desktop plus mobile
Chromium checks.

## Full Verification

Run:

```bash
npm run check
```

This executes linting, formatting checks, API tests, E2E tests, and the production dependency audit.
