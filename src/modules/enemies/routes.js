const express = require("express");
const { z } = require("zod");

const { query } = require("../../db/pool");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { id } = require("../schemas");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT enemy_id, name, health, attack_power, reward_xp, reward_currency
       FROM enemies
       ORDER BY enemy_id ASC`,
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/:enemyId",
  validate({ params: z.object({ enemyId: id }) }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT enemy_id, name, health, attack_power, reward_xp, reward_currency
       FROM enemies
       WHERE enemy_id = ?`,
      [req.params.enemyId],
    );
    if (rows.length === 0) {
      throw createError(404, "Enemy not found");
    }
    res.status(200).json(rows[0]);
  }),
);

module.exports = router;
