const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { quest: schemas } = require("../schemas");

const router = express.Router();

async function findQuest(questId) {
  const rows = await query(
    `SELECT q.quest_id, q.name, q.description, q.required_user_level,
            q.reward_xp, q.reward_currency, q.reward_item, q.enemy_id,
            e.name AS enemy_name
     FROM quests q
     LEFT JOIN enemies e ON e.enemy_id = q.enemy_id
     WHERE q.quest_id = ?`,
    [questId],
  );
  if (rows.length === 0) {
    throw createError(404, "Quest not found");
  }
  return rows[0];
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT q.quest_id, q.name, q.description, q.required_user_level,
              q.reward_xp, q.reward_currency, q.reward_item, q.enemy_id,
              e.name AS enemy_name
       FROM quests q
       LEFT JOIN enemies e ON e.enemy_id = q.enemy_id
       ORDER BY q.required_user_level ASC, q.quest_id ASC`,
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/progress",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT qp.progress_id, qp.quest_id, q.name, qp.status, qp.start_time,
              qp.end_time
       FROM quest_progress qp
       JOIN quests q ON q.quest_id = qp.quest_id
       WHERE qp.user_id = ?
       ORDER BY qp.progress_id DESC`,
      [req.user.user_id],
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/:questId",
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    res.status(200).json(await findQuest(req.params.questId));
  }),
);

const attemptHandlers = [
  requireAuth,
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const quest = await findQuest(req.params.questId);
    if (req.user.level < quest.required_user_level) {
      throw createError(403, "User does not fulfil quest level requirement");
    }

    const result = await transaction(async (connection) => {
      await connection.execute(
        `INSERT INTO quest_progress (user_id, quest_id, status, start_time, end_time)
         VALUES (?, ?, 'Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE status = 'Completed',
                                 end_time = CURRENT_TIMESTAMP`,
        [req.user.user_id, quest.quest_id],
      );
      await connection.execute(
        `UPDATE users
         SET skillpoints = skillpoints + ?, currency = currency + ?,
             total_quests_completed = total_quests_completed + 1
         WHERE user_id = ?`,
        [quest.reward_xp, quest.reward_currency, req.user.user_id],
      );
      if (quest.reward_item) {
        await connection.execute(
          `INSERT INTO inventory (user_id, item_id, quantity)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
          [req.user.user_id, quest.reward_item],
        );
      }
      const [rows] = await connection.execute(
        `SELECT progress_id, user_id, quest_id, status, start_time, end_time
         FROM quest_progress
         WHERE user_id = ? AND quest_id = ?`,
        [req.user.user_id, quest.quest_id],
      );
      return rows[0];
    });

    res.status(201).json(result);
  }),
];

router.post("/:questId/attempt", ...attemptHandlers);
router.post("/:questId", ...attemptHandlers);

module.exports = router;
