const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { inventory: schemas } = require("../schemas");

const router = express.Router();

async function findItem(itemId) {
  const rows = await query(
    "SELECT item_id, name, type, effect, rarity, cost FROM items WHERE item_id = ?",
    [itemId],
  );
  if (rows.length === 0) {
    throw createError(404, "Item not found");
  }
  return rows[0];
}

async function inventoryRows(userId) {
  return query(
    `SELECT i.inventory_id, i.item_id, it.name, it.type, it.effect, it.rarity,
            it.cost, i.quantity
     FROM inventory i
     JOIN items it ON it.item_id = i.item_id
     WHERE i.user_id = ? AND i.quantity > 0
     ORDER BY it.name ASC`,
    [userId],
  );
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(await inventoryRows(req.user.user_id));
  }),
);

router.post(
  "/item",
  requireAuth,
  validate({ body: schemas.itemOnly }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT i.inventory_id, i.item_id, it.name, it.type, it.rarity, i.quantity
       FROM inventory i
       JOIN items it ON it.item_id = i.item_id
       WHERE i.user_id = ? AND i.item_id = ? AND i.quantity > 0`,
      [req.user.user_id, req.body.item_id],
    );
    if (rows.length === 0) {
      throw createError(404, "Item not owned by user");
    }
    res.status(200).json(rows[0]);
  }),
);

router.post(
  "/buy",
  requireAuth,
  validate({ body: schemas.itemAction }),
  asyncHandler(async (req, res) => {
    const item = await findItem(req.body.item_id);
    const totalCost = item.cost * req.body.quantity;

    const result = await transaction(async (connection) => {
      const [currencyUpdate] = await connection.execute(
        `UPDATE users
         SET currency = currency - ?
         WHERE user_id = ? AND currency >= ?`,
        [totalCost, req.user.user_id, totalCost],
      );

      if (currencyUpdate.affectedRows === 0) {
        throw createError(402, "Currency is insufficient");
      }

      await connection.execute(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [req.user.user_id, item.item_id, req.body.quantity],
      );

      const [rows] = await connection.execute(
        `SELECT i.inventory_id, i.item_id, it.name, it.type, it.rarity, i.quantity
         FROM inventory i
         JOIN items it ON it.item_id = i.item_id
         WHERE i.user_id = ? AND i.item_id = ?`,
        [req.user.user_id, item.item_id],
      );
      return rows[0];
    });

    res.status(201).json(result);
  }),
);

router.post(
  "/sell",
  requireAuth,
  validate({ body: schemas.itemAction }),
  asyncHandler(async (req, res) => {
    const item = await findItem(req.body.item_id);
    const refund = Math.floor((item.cost * req.body.quantity) / 2);

    const result = await transaction(async (connection) => {
      const [inventoryUpdate] = await connection.execute(
        `UPDATE inventory
         SET quantity = quantity - ?
         WHERE user_id = ? AND item_id = ? AND quantity >= ?`,
        [req.body.quantity, req.user.user_id, item.item_id, req.body.quantity],
      );

      if (inventoryUpdate.affectedRows === 0) {
        throw createError(422, "User does not own enough item quantity");
      }

      await connection.execute(
        "UPDATE users SET currency = currency + ? WHERE user_id = ?",
        [refund, req.user.user_id],
      );

      await connection.execute(
        "DELETE FROM inventory WHERE user_id = ? AND item_id = ? AND quantity <= 0",
        [req.user.user_id, item.item_id],
      );

      const [rows] = await connection.execute(
        `SELECT i.inventory_id, i.item_id, it.name, it.type, it.rarity, i.quantity
         FROM inventory i
         JOIN items it ON it.item_id = i.item_id
         WHERE i.user_id = ? AND i.item_id = ?`,
        [req.user.user_id, item.item_id],
      );
      return rows[0] || { item_id: item.item_id, quantity: 0 };
    });

    res.status(200).json(result);
  }),
);

router.post(
  "/use",
  requireAuth,
  validate({ body: schemas.itemAction }),
  asyncHandler(async (req, res) => {
    const item = await findItem(req.body.item_id);
    if (item.type === "Food") {
      throw createError(403, "Food must be used from the pet feeding screen");
    }

    const multipliers = {
      Common: 1.25,
      Rare: 1.5,
      Epic: 1.75,
      Legendary: 2,
    };

    const result = await transaction(async (connection) => {
      const [inventoryUpdate] = await connection.execute(
        `UPDATE inventory
         SET quantity = quantity - ?
         WHERE user_id = ? AND item_id = ? AND quantity >= ?`,
        [req.body.quantity, req.user.user_id, item.item_id, req.body.quantity],
      );

      if (inventoryUpdate.affectedRows === 0) {
        throw createError(422, "User does not own enough item quantity");
      }

      const multiplier = multipliers[item.rarity] || 1;
      const field =
        item.type === "Potion"
          ? "xp_multiplier"
          : item.type === "Consumable"
            ? "currency_multiplier"
            : "attack_multiplier";
      const quantityField = `${field}_quantity`;

      await connection.execute(
        `INSERT INTO user_buffs
           (user_id, ${field}, ${quantityField})
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ${field} = GREATEST(${field}, VALUES(${field})),
                                 ${quantityField} = ${quantityField} + VALUES(${quantityField})`,
        [req.user.user_id, multiplier, req.body.quantity],
      );

      await connection.execute(
        "DELETE FROM inventory WHERE user_id = ? AND item_id = ? AND quantity <= 0",
        [req.user.user_id, item.item_id],
      );

      const [rows] = await connection.execute(
        "SELECT * FROM user_buffs WHERE user_id = ?",
        [req.user.user_id],
      );
      return rows[0];
    });

    res.status(200).json(result);
  }),
);

module.exports = router;
