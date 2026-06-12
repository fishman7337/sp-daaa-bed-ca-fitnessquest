# Security Policy

## Supported Version

Only the current `main` branch is maintained for this coursework project.

## Reporting

Do not open a public issue for secrets, account takeover, SQL injection, XSS, auth bypass, or data
exposure. Report privately to the repository owner with:

- affected route or page
- reproduction steps
- expected impact
- suggested fix, if known

## Security Baseline

- JWT secrets must be set through environment variables.
- `.env` must never be committed.
- MySQL queries must use placeholders for user input.
- User-scoped routes must derive ownership from the token.
- Frontend rendering must avoid `innerHTML` for untrusted data.
