# Contributing

Thanks for improving FitnessQuest.

## Local Workflow

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and configure MySQL.
3. Run `npm run db:reset`.
4. Make focused changes.
5. Run `npm run check` before opening a pull request.

## Standards

- Keep protected actions tied to `req.user.user_id`.
- Validate request data with Zod.
- Do not expose password hashes or raw errors.
- Prefer small modules and clear names.
- Add or update tests for changed behavior.

## Commit Style

Use concise imperative commits, for example:

```text
Harden challenge ownership checks
```
