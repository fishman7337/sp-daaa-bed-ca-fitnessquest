INSERT INTO users
  (username, email, password_hash, level, skillpoints, currency, total_quests_completed, total_battles_won)
VALUES
  ('John Doe', 'johndoe@example.com', '$2b$10$m6ah2BVCucGd9Hc8zboSw.C2kUph0Vvz7kS5WDZqU4F/9OMcGlPWS', 1, 0, 100, 0, 0),
  ('Jane Doe', 'janedoe@example.com', '$2b$10$jyJcbw16H7HvV8S6N30ml.J76CmzLystxsUTBM479roTW6rJtYsjm', 1, 0, 100, 0, 0),
  ('Kun Ming', 'kunming@example.com', '$2b$10$cYczpILNOWSevOGlvw8AMe2YExzRksmn9Ccl/Ttr5BwApCm4TOq.y', 100, 9900, 100000, 3, 4);

INSERT INTO user_buffs (user_id)
VALUES (1), (2), (3);

INSERT INTO enemies (name, health, attack_power, reward_xp, reward_currency)
VALUES
  ('Training Dummy', 30, 2, 15, 5),
  ('Orc Warrior', 100, 20, 50, 20),
  ('Dark Mage', 150, 30, 100, 50),
  ('Fire Dragon', 500, 50, 500, 200),
  ('Shadow Lord', 1000, 75, 1000, 500);

INSERT INTO items (name, type, effect, rarity, cost)
VALUES
  ('Basic Pet Food', 'Food', 'Increases pet stats by a small amount.', 'Common', 10),
  ('Premium Pet Food', 'Food', 'Increases pet stats by a moderate amount.', 'Rare', 15),
  ('Deluxe Pet Food', 'Food', 'Increases pet stats by a large amount.', 'Epic', 20),
  ('Legendary Pet Food', 'Food', 'Increases pet stats by a legendary amount.', 'Legendary', 25),
  ('Minor XP Potion', 'Potion', 'Grants a stronger XP multiplier.', 'Common', 20),
  ('Major XP Potion', 'Potion', 'Grants a stronger XP multiplier.', 'Rare', 30),
  ('Superior XP Potion', 'Potion', 'Grants a stronger XP multiplier.', 'Epic', 40),
  ('Ultimate XP Potion', 'Potion', 'Grants a stronger XP multiplier.', 'Legendary', 50),
  ('Common Sword', 'Equipment', 'Grants a stronger attack multiplier.', 'Common', 20),
  ('Rare Sword', 'Equipment', 'Grants a stronger attack multiplier.', 'Rare', 30),
  ('Epic Sword', 'Equipment', 'Grants a stronger attack multiplier.', 'Epic', 40),
  ('Legendary Sword', 'Equipment', 'Grants a stronger attack multiplier.', 'Legendary', 50),
  ('Basic Coin Bag', 'Consumable', 'Grants a stronger currency multiplier.', 'Common', 20),
  ('Advanced Coin Bag', 'Consumable', 'Grants a stronger currency multiplier.', 'Rare', 30),
  ('Elite Coin Bag', 'Consumable', 'Grants a stronger currency multiplier.', 'Epic', 40),
  ('Mythic Coin Bag', 'Consumable', 'Grants a stronger currency multiplier.', 'Legendary', 50);

INSERT INTO pets (user_id, name, level, experience, health, attack_power)
VALUES
  (1, 'Starter Fox', 1, 0, 100, 15),
  (2, 'Trail Lynx', 1, 0, 100, 15),
  (3, 'Maximus', 100, 10000, 1000, 500);

INSERT INTO challenges (creator_id, challenge, skillpoints)
VALUES
  (1, 'Complete 2.4 km within 15 minutes', 50),
  (1, 'Cycle around the island for at least 50 km', 100),
  (2, 'Complete a full marathon', 200),
  (2, 'Hold a plank for 5 minutes', 50),
  (2, 'Perform 100 push-ups in one session', 75);

INSERT INTO quests (name, description, required_user_level, reward_xp, reward_currency, reward_item, enemy_id)
VALUES
  ('Training Day', 'Defeat the training dummy and warm up safely.', 1, 50, 20, 1, 1),
  ('Orc Rampage', 'Eliminate the Orc Warriors attacking the town.', 5, 100, 50, 2, 2),
  ('Mage Hunt', 'Track and defeat the Dark Mage causing chaos.', 10, 200, 100, 3, 3),
  ('Dragon Slayer', 'Slay the mighty Fire Dragon.', 20, 500, 200, 3, 4),
  ('Shadow Conqueror', 'Defeat the Shadow Lord to save the kingdom.', 50, 1000, 500, 1, 5);

INSERT INTO achievements
  (name, description, experience_requirement, total_quest_completed_requirement, level_requirement, currency_requirement, reward_xp, reward_item)
VALUES
  ('Novice Adventurer', 'Complete your first quest.', 0, 1, 0, 0, 50, 1),
  ('Seasoned Explorer', 'Complete 10 quests.', 0, 10, 0, 0, 200, 2),
  ('Wealth Hoarder', 'Earn 1000 currency.', 0, 0, 0, 1000, 0, 4),
  ('Master of Battles', 'Win 50 battles.', 0, 0, 0, 0, 500, 3),
  ('Ultimate Hero', 'Reach level 50.', 0, 0, 50, 0, 1000, 1);

INSERT INTO inventory (user_id, item_id, quantity)
VALUES
  (1, 1, 2),
  (1, 5, 1),
  (2, 2, 1),
  (3, 4, 5),
  (3, 12, 2);
