const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { query } = require("../db/pool");
const { createError } = require("../utils/httpError");

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user.user_id),
      username: user.username,
    },
    env.JWT_SECRET_KEY,
    {
      algorithm: env.JWT_ALGORITHM,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw createError(401, "Authentication token required");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET_KEY, {
      algorithms: [env.JWT_ALGORITHM],
    });

    const rows = await query(
      `SELECT user_id, username, email, level, skillpoints, currency,
              total_quests_completed, total_battles_won
       FROM users
       WHERE user_id = ?`,
      [Number(decoded.sub)],
    );

    if (rows.length === 0) {
      throw createError(401, "Invalid authentication token");
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(createError(401, "Invalid authentication token"));
    }
    return next(error);
  }
}

module.exports = {
  requireAuth,
  signToken,
};
