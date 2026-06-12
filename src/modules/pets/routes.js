const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { pet: schemas } = require("../schemas");

const router = express.Router();

async function findOwnedPet(userId, petId) {
  const rows = await query(
    `SELECT pet_id, user_id, name, level, experience, health, attack_power,
            creation_date
     FROM pets
     WHERE user_id = ? AND pet_id = ?`,
    [userId, petId],
  );

  if (rows.length === 0) {
    throw createError(403, "Pet does not belong to user");
  }
  return rows[0];
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT pet_id, user_id, name, level, experience, health, attack_power,
              creation_date
       FROM pets
       WHERE user_id = ?
       ORDER BY pet_id ASC`,
      [req.user.user_id],
    );
    res.status(200).json(rows);
  }),
);

router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT p.pet_id, p.user_id, u.username, p.name, p.level, p.experience,
              p.health, p.attack_power
       FROM pets p
       JOIN users u ON u.user_id = p.user_id
       ORDER BY p.level DESC, p.pet_id ASC`,
    );
    res.status(200).json(rows);
  }),
);

router.post(
  "/",
  requireAuth,
  validate({ body: schemas.body }),
  asyncHandler(async (req, res) => {
    const result = await query(
      "INSERT INTO pets (user_id, name) VALUES (?, ?)",
      [req.user.user_id, req.body.name],
    );
    res.status(201).json(await findOwnedPet(req.user.user_id, result.insertId));
  }),
);

router.post(
  "/feed",
  requireAuth,
  validate({ body: schemas.action }),
  asyncHandler(async (req, res) => {
    const pet = await findOwnedPet(req.user.user_id, req.body.pet_id);
    const itemId = req.body.item_id;

    if (!itemId) {
      throw createError(400, "Food item required");
    }

    const result = await transaction(async (connection) => {
      const [items] = await connection.execute(
        "SELECT item_id, type, rarity FROM items WHERE item_id = ?",
        [itemId],
      );
      if (items.length === 0 || items[0].type !== "Food") {
        throw createError(403, "Item is not pet food");
      }

      const [inventoryUpdate] = await connection.execute(
        `UPDATE inventory
         SET quantity = quantity - 1
         WHERE user_id = ? AND item_id = ? AND quantity >= 1`,
        [req.user.user_id, itemId],
      );
      if (inventoryUpdate.affectedRows === 0) {
        throw createError(422, "Insufficient food quantity");
      }

      const boost =
        { Common: 1, Rare: 2, Epic: 3, Legendary: 4 }[items[0].rarity] || 1;
      await connection.execute(
        `UPDATE pets
         SET health = health + ?, attack_power = attack_power + ?,
             experience = experience + ?
         WHERE pet_id = ? AND user_id = ?`,
        [boost * 5, boost * 2, boost * 10, pet.pet_id, req.user.user_id],
      );
      await connection.execute(
        "DELETE FROM inventory WHERE user_id = ? AND item_id = ? AND quantity <= 0",
        [req.user.user_id, itemId],
      );
      const [rows] = await connection.execute(
        `SELECT pet_id, user_id, name, level, experience, health, attack_power
         FROM pets
         WHERE pet_id = ?`,
        [pet.pet_id],
      );
      return rows[0];
    });

    res.status(200).json(result);
  }),
);

router.post(
  "/level-up",
  requireAuth,
  validate({ body: schemas.action }),
  asyncHandler(async (req, res) => {
    const pet = await findOwnedPet(req.user.user_id, req.body.pet_id);
    if (pet.experience < pet.level * 100) {
      throw createError(422, "Insufficient experience for pet level up");
    }

    await query(
      `UPDATE pets
       SET level = level + 1, experience = experience - (level * 100),
           health = health + 25, attack_power = attack_power + 5
       WHERE pet_id = ? AND user_id = ?`,
      [pet.pet_id, req.user.user_id],
    );
    res.status(200).json(await findOwnedPet(req.user.user_id, pet.pet_id));
  }),
);

module.exports = router;
