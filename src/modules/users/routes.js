const express = require("express");

const { query } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { asyncHandler } = require("../../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT user_id, username, level, skillpoints, currency,
              total_quests_completed, total_battles_won
       FROM users
       ORDER BY user_id ASC`,
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
  }),
);

router.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT user_id, username, level, skillpoints, total_quests_completed,
              total_battles_won
       FROM users
       ORDER BY skillpoints DESC, total_battles_won DESC, username ASC
       LIMIT 25`,
    );
    res.status(200).json(rows);
  }),
);

router.put(
  "/me/level-up",
  requireAuth,
  asyncHandler(async (req, res) => {
    const level = Math.floor(req.user.skillpoints / 100) + 1;
    if (level <= req.user.level) {
      return res
        .status(422)
        .json({ message: "Insufficient skillpoints for level up" });
    }

    await query("UPDATE users SET level = ? WHERE user_id = ?", [
      level,
      req.user.user_id,
    ]);

    const rows = await query(
      `SELECT user_id, username, email, level, skillpoints, currency,
              total_quests_completed, total_battles_won
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id],
    );
    res.status(200).json(rows[0]);
  }),
);

module.exports = router;
