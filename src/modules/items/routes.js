const express = require("express");

const { query } = require("../../db/pool");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { z } = require("zod");
const { id } = require("../schemas");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT item_id, name, type, effect, rarity, cost
       FROM items
       ORDER BY FIELD(rarity, 'Common', 'Rare', 'Epic', 'Legendary'), item_id`,
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/:itemId",
  validate({ params: z.object({ itemId: id }) }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT item_id, name, type, effect, rarity, cost
       FROM items
       WHERE item_id = ?`,
      [req.params.itemId],
    );
    if (rows.length === 0) {
      throw createError(404, "Item not found");
    }
    res.status(200).json(rows[0]);
  }),
);

module.exports = router;
