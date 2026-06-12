SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS battles;
DROP TABLE IF EXISTS quest_progress;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS challenge_completions;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS enemies;
DROP TABLE IF EXISTS user_buffs;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  skillpoints INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  currency INT NOT NULL DEFAULT 0,
  total_quests_completed INT NOT NULL DEFAULT 0,
  total_battles_won INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_non_negative CHECK (
    skillpoints >= 0 AND level >= 1 AND currency >= 0
  )
);

CREATE TABLE user_buffs (
  user_buff_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  xp_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  xp_multiplier_quantity INT NOT NULL DEFAULT 0,
  currency_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  currency_multiplier_quantity INT NOT NULL DEFAULT 0,
  attack_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  attack_multiplier_quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE enemies (
  enemy_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  health INT NOT NULL DEFAULT 100,
  attack_power INT NOT NULL DEFAULT 10,
  reward_xp INT NOT NULL DEFAULT 0,
  reward_currency INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_enemies_non_negative CHECK (
    health > 0 AND attack_power > 0 AND reward_xp >= 0 AND reward_currency >= 0
  )
);

CREATE TABLE items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('Potion', 'Equipment', 'Consumable', 'Key Item', 'Food') NOT NULL,
  effect VARCHAR(255) NOT NULL,
  rarity ENUM('Common', 'Rare', 'Epic', 'Legendary') NOT NULL,
  cost INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_items_non_negative CHECK (cost >= 0)
);

CREATE TABLE quests (
  quest_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  required_user_level INT NOT NULL DEFAULT 1,
  reward_xp INT NOT NULL DEFAULT 0,
  reward_currency INT NOT NULL DEFAULT 0,
  reward_item INT NULL,
  enemy_id INT NULL,
  FOREIGN KEY (reward_item) REFERENCES items(item_id) ON DELETE SET NULL,
  FOREIGN KEY (enemy_id) REFERENCES enemies(enemy_id) ON DELETE SET NULL
);

CREATE TABLE challenges (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  challenge VARCHAR(500) NOT NULL,
  skillpoints INT NOT NULL,
  reward_currency INT NOT NULL DEFAULT 0,
  reward_item INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reward_item) REFERENCES items(item_id) ON DELETE SET NULL,
  CONSTRAINT chk_challenges_non_negative CHECK (skillpoints >= 0 AND reward_currency >= 0)
);

CREATE TABLE challenge_completions (
  complete_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT NOT NULL,
  user_id INT NOT NULL,
  completed BOOLEAN NOT NULL,
  notes TEXT,
  creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reward_currency INT NOT NULL DEFAULT 0,
  reward_item INT NULL,
  FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reward_item) REFERENCES items(item_id) ON DELETE SET NULL
);

CREATE TABLE pets (
  pet_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  health INT NOT NULL DEFAULT 100,
  attack_power INT NOT NULL DEFAULT 10,
  creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_pet_name (user_id, name),
  CONSTRAINT chk_pets_non_negative CHECK (
    level >= 1 AND experience >= 0 AND health > 0 AND attack_power > 0
  )
);

CREATE TABLE inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_user_item (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  CONSTRAINT chk_inventory_non_negative CHECK (quantity >= 0)
);

CREATE TABLE quest_progress (
  progress_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quest_id INT NOT NULL,
  status ENUM('In Progress', 'Completed', 'Failed') NOT NULL DEFAULT 'In Progress',
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  UNIQUE KEY unique_user_quest (user_id, quest_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (quest_id) REFERENCES quests(quest_id) ON DELETE CASCADE
);

CREATE TABLE battles (
  battle_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pet_id INT NOT NULL,
  enemy_id INT NOT NULL,
  result ENUM('Win', 'Lose', 'Draw') NOT NULL,
  xp_earned INT NOT NULL DEFAULT 0,
  currency_earned INT NOT NULL DEFAULT 0,
  damage_taken INT NOT NULL DEFAULT 0,
  damage_dealt INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,
  FOREIGN KEY (enemy_id) REFERENCES enemies(enemy_id) ON DELETE CASCADE
);

CREATE TABLE achievements (
  achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  experience_requirement INT NOT NULL DEFAULT 0,
  total_quest_completed_requirement INT NOT NULL DEFAULT 0,
  level_requirement INT NOT NULL DEFAULT 0,
  currency_requirement INT NOT NULL DEFAULT 0,
  reward_xp INT NOT NULL DEFAULT 0,
  reward_item INT NULL,
  FOREIGN KEY (reward_item) REFERENCES items(item_id) ON DELETE SET NULL
);

CREATE TABLE user_achievements (
  user_achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  completion_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_amt INT NOT NULL,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_challenge_review (user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE,
  CONSTRAINT chk_review_range CHECK (review_amt BETWEEN 1 AND 5)
);
