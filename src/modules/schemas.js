const { z } = require("zod");

const id = z.coerce.number().int().positive();
const optionalPositiveInt = z.coerce.number().int().positive().optional();
const text = z.string().trim().min(1).max(255);

const auth = {
  login: z.object({
    username: text.max(50),
    password: z.string().min(1).max(128),
  }),
  register: z.object({
    username: text.max(50),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  }),
};

const challenge = {
  params: z.object({ challengeId: id }),
  body: z.object({
    challenge: text.max(500),
    skillpoints: z.coerce.number().int().min(0).max(1000),
  }),
  completion: z.object({
    completed: z.coerce.boolean(),
    notes: z.string().trim().max(1000).default(""),
    creation_date: z.string().trim().optional(),
  }),
};

const review = {
  params: z.object({ reviewId: id }),
  challengeParams: z.object({ challengeId: id }),
  body: z.object({
    challenge_id: id,
    review_amt: z.coerce.number().int().min(1).max(5),
  }),
  update: z.object({
    review_amt: z.coerce.number().int().min(1).max(5),
  }),
};

const pet = {
  params: z.object({ petId: id }),
  body: z.object({ name: text.max(50) }),
  action: z.object({
    pet_id: id,
    item_id: optionalPositiveInt,
  }),
};

const inventory = {
  itemAction: z.object({
    item_id: id,
    quantity: z.coerce.number().int().positive().max(999),
  }),
  itemOnly: z.object({ item_id: id }),
};

const battle = {
  fight: z.object({
    pet_id: id,
    enemy_id: id,
  }),
};

const quest = {
  params: z.object({ questId: id }),
};

const achievement = {
  params: z.object({ achievementId: id }),
};

module.exports = {
  achievement,
  auth,
  battle,
  challenge,
  id,
  inventory,
  pet,
  quest,
  review,
};
