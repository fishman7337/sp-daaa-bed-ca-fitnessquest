# API Overview

All canonical routes are under `/api`. Protected routes require:

```text
Authorization: Bearer <token>
```

## Auth

- `POST /api/auth/register` - create a user and receive a token.
- `POST /api/auth/login` - authenticate and receive a token.
- `GET /api/auth/me` - return the current safe profile.

## Users

- `GET /api/users` - public safe user list.
- `GET /api/users/me` - current user profile.
- `PUT /api/users/me/level-up` - update level from skillpoints.
- `GET /api/users/leaderboard` - leaderboard.

## Game Resources

- `GET /api/challenges`, `POST /api/challenges`
- `GET /api/challenges/:challengeId`, `PUT /api/challenges/:challengeId`, `DELETE /api/challenges/:challengeId`
- `POST /api/challenges/:challengeId` - record a completion attempt.
- `GET /api/reviews/challenges/:challengeId`, `POST /api/reviews`
- `GET /api/items`, `GET /api/enemies`
- `GET /api/inventory`, `POST /api/inventory/buy`, `POST /api/inventory/sell`, `POST /api/inventory/use`
- `GET /api/pets`, `POST /api/pets`, `POST /api/pets/feed`, `POST /api/pets/level-up`
- `GET /api/battles`, `POST /api/battles/fight`
- `GET /api/quests`, `POST /api/quests/:questId/attempt`
- `GET /api/achievements`, `GET /api/achievements/me`, `POST /api/achievements/:achievementId/claim`

Legacy aliases for safe coursework paths are retained where practical, including `/login`,
`/register`, and resource roots. Public demo helper endpoints for raw JWT and bcrypt operations are
removed.
