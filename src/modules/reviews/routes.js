const express = require("express");

const { query } = require("../../db/pool");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { asyncHandler } = require("../../utils/asyncHandler");
const { createError } = require("../../utils/httpError");
const { review: schemas } = require("../schemas");

const router = express.Router();

router.get(
  "/challenges/:challengeId",
  validate({ params: schemas.challengeParams }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT r.id, r.challenge_id, r.user_id, u.username, r.review_amt,
              r.created_at
       FROM reviews r
       JOIN users u ON u.user_id = r.user_id
       WHERE r.challenge_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.challengeId],
    );
    res.status(200).json(rows);
  }),
);

router.post(
  "/",
  requireAuth,
  validate({ body: schemas.body }),
  asyncHandler(async (req, res) => {
    await query(
      `INSERT INTO reviews (review_amt, user_id, challenge_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE review_amt = VALUES(review_amt), created_at = CURRENT_TIMESTAMP`,
      [req.body.review_amt, req.user.user_id, req.body.challenge_id],
    );

    const rows = await query(
      `SELECT id, challenge_id, user_id, review_amt, created_at
       FROM reviews
       WHERE challenge_id = ? AND user_id = ?`,
      [req.body.challenge_id, req.user.user_id],
    );
    res.status(201).json(rows[0]);
  }),
);

router.get(
  "/:reviewId",
  requireAuth,
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, challenge_id, user_id, review_amt, created_at
       FROM reviews
       WHERE id = ? AND user_id = ?`,
      [req.params.reviewId, req.user.user_id],
    );
    if (rows.length === 0) {
      throw createError(404, "Review not found");
    }
    res.status(200).json(rows[0]);
  }),
);

router.put(
  "/:reviewId",
  requireAuth,
  validate({ params: schemas.params, body: schemas.update }),
  asyncHandler(async (req, res) => {
    const result = await query(
      `UPDATE reviews
       SET review_amt = ?, created_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [req.body.review_amt, req.params.reviewId, req.user.user_id],
    );
    if (result.affectedRows === 0) {
      throw createError(403, "You do not own this review");
    }
    res.status(204).send();
  }),
);

router.delete(
  "/:reviewId",
  requireAuth,
  validate({ params: schemas.params }),
  asyncHandler(async (req, res) => {
    const result = await query(
      "DELETE FROM reviews WHERE id = ? AND user_id = ?",
      [req.params.reviewId, req.user.user_id],
    );
    if (result.affectedRows === 0) {
      throw createError(403, "You do not own this review");
    }
    res.status(204).send();
  }),
);

module.exports = router;
