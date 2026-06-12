const bcrypt = require("bcrypt");
const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth, signToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { auth: schemas } = require("../schemas");

const router = express.Router();

function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    level: user.level,
    skillpoints: user.skillpoints,
    currency: user.currency,
    total_quests_completed: user.total_quests_completed,
    total_battles_won: user.total_battles_won,
  };
}

const login = [
  validate({ body: schemas.login }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT user_id, username, email, password_hash, level, skillpoints, currency,
              total_quests_completed, total_battles_won
       FROM users
       WHERE username = ?`,
      [req.body.username],
    );

    if (rows.length === 0) {
      throw createError(401, "Invalid username or password");
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(req.body.password, user.password_hash);
    if (!isMatch) {
      throw createError(401, "Invalid username or password");
    }

    res.status(200).json({
      message: "Login successful",
      token: signToken(user),
      user: sanitizeUser(user),
    });
  }),
];

const register = [
  validate({ body: schemas.register }),
  asyncHandler(async (req, res) => {
    const duplicate = await query(
      "SELECT user_id FROM users WHERE username = ? OR email = ? LIMIT 1",
      [req.body.username, req.body.email],
    );

    if (duplicate.length > 0) {
      throw createError(409, "Username or email already exists");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await transaction(async (connection) => {
      const [created] = await connection.execute(
        `INSERT INTO users (username, email, password_hash, currency)
         VALUES (?, ?, ?, 100)`,
        [req.body.username, req.body.email, passwordHash],
      );
      await connection.execute("INSERT INTO user_buffs (user_id) VALUES (?)", [
        created.insertId,
      ]);
      const [rows] = await connection.execute(
        `SELECT user_id, username, email, level, skillpoints, currency,
                total_quests_completed, total_battles_won
         FROM users
         WHERE user_id = ?`,
        [created.insertId],
      );
      return rows[0];
    });

    res.status(201).json({
      message: `User ${user.username} created successfully`,
      token: signToken(user),
      user,
    });
  }),
];

router.post("/login", login);
router.post("/register", register);
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(sanitizeUser(req.user));
  }),
);

router.login = login;
router.register = register;
router.sanitizeUser = sanitizeUser;

module.exports = router;
