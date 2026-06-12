const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { achievement: schemas } = require("../schemas");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT achievement_id, name, description, experience_requirement,
              total_quest_completed_requirement, level_requirement,
              currency_requirement, reward_xp, reward_item
       FROM achievements
       ORDER BY achievement_id ASC`,
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT ua.user_achievement_id, ua.achievement_id, a.name, a.description,
              ua.completion_date
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.completion_date DESC`,
      [req.user.user_id],
    );
    res.status(200).json(rows);
  }),
);

const claimHandlers = [
  requireAuth,
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const achievements = await query(
      `SELECT achievement_id, name, experience_requirement,
              total_quest_completed_requirement, level_requirement,
              currency_requirement, reward_xp, reward_item
       FROM achievements
       WHERE achievement_id = ?`,
      [req.params.achievementId],
    );
    if (achievements.length === 0) {
      throw createError(404, "Achievement not found");
    }

    const achievement = achievements[0];
    const qualifies =
      req.user.skillpoints >= achievement.experience_requirement &&
      req.user.total_quests_completed >=
        achievement.total_quest_completed_requirement &&
      req.user.level >= achievement.level_requirement &&
      req.user.currency >= achievement.currency_requirement;

    if (!qualifies) {
      throw createError(403, "Achievement requirements are not met");
    }

    const result = await transaction(async (connection) => {
      try {
        await connection.execute(
          `INSERT INTO user_achievements (user_id, achievement_id)
           VALUES (?, ?)`,
          [req.user.user_id, achievement.achievement_id],
        );
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          throw createError(409, "Achievement already claimed");
        }
        throw error;
      }

      await connection.execute(
        "UPDATE users SET skillpoints = skillpoints + ? WHERE user_id = ?",
        [achievement.reward_xp, req.user.user_id],
      );
      if (achievement.reward_item) {
        await connection.execute(
          `INSERT INTO inventory (user_id, item_id, quantity)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
          [req.user.user_id, achievement.reward_item],
        );
      }
      const [rows] = await connection.execute(
        `SELECT ua.user_achievement_id, ua.achievement_id, a.name,
                ua.completion_date
         FROM user_achievements ua
         JOIN achievements a ON a.achievement_id = ua.achievement_id
         WHERE ua.user_id = ? AND ua.achievement_id = ?`,
        [req.user.user_id, achievement.achievement_id],
      );
      return rows[0];
    });

    res.status(201).json(result);
  }),
];

router.post("/:achievementId/claim", ...claimHandlers);
router.post("/:achievementId", ...claimHandlers);

module.exports = router;
