const express = require("express");

const { query, transaction } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { challenge: schemas } = require("../schemas");

const router = express.Router();

async function findChallenge(challengeId) {
  const rows = await query(
    `SELECT challenge_id, creator_id, challenge, skillpoints, reward_currency,
            reward_item
     FROM challenges
     WHERE challenge_id = ?`,
    [challengeId],
  );

  if (rows.length === 0) {
    throw createError(404, "Challenge not found");
  }
  return rows[0];
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT c.challenge_id, c.creator_id, u.username AS creator_name,
              c.challenge, c.skillpoints, c.reward_currency, c.reward_item
       FROM challenges c
       JOIN users u ON u.user_id = c.creator_id
       ORDER BY c.skillpoints DESC, c.challenge_id ASC`,
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
      `INSERT INTO challenges (creator_id, challenge, skillpoints)
       VALUES (?, ?, ?)`,
      [req.user.user_id, req.body.challenge, req.body.skillpoints],
    );

    const created = await findChallenge(result.insertId);
    res.status(201).json(created);
  }),
);

router.get(
  "/single/:challengeId",
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    res.status(200).json(await findChallenge(req.params.challengeId));
  }),
);

router.get(
  "/:challengeId",
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const challenge = await findChallenge(req.params.challengeId);
    const completions = await query(
      `SELECT uc.complete_id, uc.user_id, u.username, uc.completed, uc.notes,
              uc.creation_date
       FROM challenge_completions uc
       JOIN users u ON u.user_id = uc.user_id
       WHERE uc.challenge_id = ?
       ORDER BY uc.complete_id DESC`,
      [req.params.challengeId],
    );
    res.status(200).json({ ...challenge, completions });
  }),
);

router.put(
  "/:challengeId",
  requireAuth,
  validate({ params: schemas.params, body: schemas.body }),
  asyncHandler(async (req, res) => {
    const result = await query(
      `UPDATE challenges
       SET challenge = ?, skillpoints = ?
       WHERE challenge_id = ? AND creator_id = ?`,
      [
        req.body.challenge,
        req.body.skillpoints,
        req.params.challengeId,
        req.user.user_id,
      ],
    );

    if (result.affectedRows === 0) {
      throw createError(403, "Only the creator can update this challenge");
    }

    res.status(200).json(await findChallenge(req.params.challengeId));
  }),
);

router.delete(
  "/:challengeId",
  requireAuth,
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const result = await query(
      "DELETE FROM challenges WHERE challenge_id = ? AND creator_id = ?",
      [req.params.challengeId, req.user.user_id],
    );

    if (result.affectedRows === 0) {
      throw createError(403, "Only the creator can delete this challenge");
    }

    res.status(204).send();
  }),
);

router.post(
  "/:challengeId",
  requireAuth,
  validate({ params: schemas.params, body: schemas.completion }),
  asyncHandler(async (req, res) => {
    const challenge = await findChallenge(req.params.challengeId);
    const completed = req.body.completed ? 1 : 0;
    const notes = req.body.notes || "";
    const creationDate = req.body.creation_date || null;

    const completion = await transaction(async (connection) => {
      const [created] = await connection.execute(
        `INSERT INTO challenge_completions
           (challenge_id, user_id, completed, notes, creation_date)
         VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          req.params.challengeId,
          req.user.user_id,
          completed,
          notes,
          creationDate,
        ],
      );

      const reward = completed ? challenge.skillpoints : 5;
      await connection.execute(
        "UPDATE users SET skillpoints = skillpoints + ? WHERE user_id = ?",
        [reward, req.user.user_id],
      );

      const [rows] = await connection.execute(
        `SELECT complete_id, challenge_id, user_id, completed, notes, creation_date
         FROM challenge_completions
         WHERE complete_id = ?`,
        [created.insertId],
      );
      return rows[0];
    });

    res.status(201).json(completion);
  }),
);

router.get(
  "/:challengeId/completions",
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    await findChallenge(req.params.challengeId);
    const rows = await query(
      `SELECT complete_id, challenge_id, user_id, completed, notes, creation_date
       FROM challenge_completions
       WHERE challenge_id = ?
       ORDER BY complete_id DESC`,
      [req.params.challengeId],
    );
    res.status(200).json(rows);
  }),
);

module.exports = router;
