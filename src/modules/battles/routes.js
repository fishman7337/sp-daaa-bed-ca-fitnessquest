const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { battle: schemas } = require("../schemas");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT b.battle_id, b.pet_id, p.name AS pet_name, b.enemy_id,
              e.name AS enemy_name, b.result, b.xp_earned, b.currency_earned,
              b.damage_taken, b.damage_dealt, b.created_at
       FROM battles b
       JOIN pets p ON p.pet_id = b.pet_id
       JOIN enemies e ON e.enemy_id = b.enemy_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.user_id],
    );
    res.status(200).json(rows);
  }),
);

const fightHandlers = [
  requireAuth,
  validate({ body: schemas.fight }),
  asyncHandler(async (req, res) => {
    const result = await transaction(async (connection) => {
      const [pets] = await connection.execute(
        `SELECT pet_id, health, attack_power
         FROM pets
         WHERE pet_id = ? AND user_id = ?`,
        [req.body.pet_id, req.user.user_id],
      );
      if (pets.length === 0) {
        throw createError(403, "Pet does not belong to user");
      }

      const [enemies] = await connection.execute(
        `SELECT enemy_id, health, attack_power, reward_xp, reward_currency
         FROM enemies
         WHERE enemy_id = ?`,
        [req.body.enemy_id],
      );
      if (enemies.length === 0) {
        throw createError(404, "Enemy not found");
      }

      const [buffs] = await connection.execute(
        `SELECT xp_multiplier, currency_multiplier, attack_multiplier
         FROM user_buffs
         WHERE user_id = ?`,
        [req.user.user_id],
      );

      const pet = pets[0];
      const enemy = enemies[0];
      const buff = buffs[0] || {};
      const petAttack = Math.ceil(
        pet.attack_power * Number(buff.attack_multiplier || 1),
      );
      const roundsToDefeatEnemy = Math.ceil(enemy.health / petAttack);
      const roundsToDefeatPet = Math.ceil(pet.health / enemy.attack_power);
      const outcome =
        roundsToDefeatEnemy < roundsToDefeatPet
          ? "Win"
          : roundsToDefeatEnemy === roundsToDefeatPet
            ? "Draw"
            : "Lose";
      const xpEarned =
        outcome === "Win"
          ? Math.floor(enemy.reward_xp * Number(buff.xp_multiplier || 1))
          : 0;
      const currencyEarned =
        outcome === "Win"
          ? Math.floor(
              enemy.reward_currency * Number(buff.currency_multiplier || 1),
            )
          : 0;
      const damageDealt = Math.min(
        enemy.health,
        petAttack * roundsToDefeatEnemy,
      );
      const damageTaken = Math.min(
        pet.health,
        enemy.attack_power * roundsToDefeatEnemy,
      );

      const [created] = await connection.execute(
        `INSERT INTO battles
           (user_id, pet_id, enemy_id, result, xp_earned, currency_earned,
            damage_taken, damage_dealt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          pet.pet_id,
          enemy.enemy_id,
          outcome,
          xpEarned,
          currencyEarned,
          damageTaken,
          damageDealt,
        ],
      );

      if (outcome === "Win") {
        await connection.execute(
          `UPDATE users
           SET skillpoints = skillpoints + ?, currency = currency + ?,
               total_battles_won = total_battles_won + 1
           WHERE user_id = ?`,
          [xpEarned, currencyEarned, req.user.user_id],
        );
        await connection.execute(
          "UPDATE pets SET experience = experience + ? WHERE pet_id = ?",
          [xpEarned, pet.pet_id],
        );
      }

      const [rows] = await connection.execute(
        `SELECT battle_id, user_id, pet_id, enemy_id, result, xp_earned,
                currency_earned, damage_taken, damage_dealt, created_at
         FROM battles
         WHERE battle_id = ?`,
        [created.insertId],
      );
      return rows[0];
    });

    res.status(201).json(result);
  }),
];

router.post("/fight", ...fightHandlers);
router.post("/", ...fightHandlers);

module.exports = router;
