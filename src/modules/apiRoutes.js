const express = require("express");

const achievements = require("./achievements/routes");
const auth = require("./auth/routes");
const battles = require("./battles/routes");
const challenges = require("./challenges/routes");
const enemies = require("./enemies/routes");
const inventory = require("./inventory/routes");
const items = require("./items/routes");
const pets = require("./pets/routes");
const quests = require("./quests/routes");
const reviews = require("./reviews/routes");
const users = require("./users/routes");

const router = express.Router();
const legacyRouter = express.Router();

router.use("/achievements", achievements);
router.use("/auth", auth);
router.use("/battles", battles);
router.use("/challenges", challenges);
router.use("/enemies", enemies);
router.use("/inventory", inventory);
router.use("/items", items);
router.use("/pets", pets);
router.use("/quests", quests);
router.use("/reviews", reviews);
router.use("/users", users);

legacyRouter.post("/login", auth.login);
legacyRouter.post("/register", auth.register);
legacyRouter.use("/achievements", achievements);
legacyRouter.use("/battles", battles);
legacyRouter.use("/challenges", challenges);
legacyRouter.use("/enemies", enemies);
legacyRouter.use("/inventory", inventory);
legacyRouter.use("/items", items);
legacyRouter.use("/pets", pets);
legacyRouter.use("/quests", quests);
legacyRouter.use("/quest-progression", quests);
legacyRouter.use("/review", reviews);
legacyRouter.use("/reviews", reviews);
legacyRouter.use("/users", users);

router.legacyRouter = legacyRouter;

module.exports = router;
