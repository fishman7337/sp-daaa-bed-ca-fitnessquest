import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, el, renderTable, setStatus } from "../shared/dom.js";

const user = await requireLogin();
wireLogout();

if (user) {
  byId("profile-name").textContent = user.username;
  byId("profile-level").textContent = user.level;
  byId("profile-skillpoints").textContent = user.skillpoints;
  byId("profile-currency").textContent = user.currency;
  byId("profile-quests").textContent = user.total_quests_completed;
  byId("profile-battles").textContent = user.total_battles_won;

  byId("level-up").addEventListener("click", async () => {
    const status = byId("profile-status");
    try {
      setStatus(status, "Checking level...");
      const updated = await api("/users/me/level-up", { method: "PUT" });
      byId("profile-level").textContent = updated.level;
      setStatus(status, "Level updated.");
    } catch (error) {
      setStatus(status, error.message, true);
    }
  });

  const leaderboard = await api("/users/leaderboard");
  renderTable(
    byId("leaderboard"),
    [
      { key: "username", label: "Player" },
      { key: "level", label: "Level" },
      { key: "skillpoints", label: "Skillpoints" },
      { key: "total_battles_won", label: "Battles Won" },
    ],
    leaderboard,
  );

  const featureGrid = byId("feature-grid");
  [
    ["Challenges", "Create and complete fitness challenges for points."],
    ["Pets", "Feed, level, and battle with your companion."],
    ["Inventory", "Buy, sell, and use buffs earned through play."],
    ["Quests", "Clear milestone quests and claim rewards."],
  ].forEach(([title, copy]) => {
    featureGrid.appendChild(
      el("article", { className: "card" }, [
        el("h3", { text: title }),
        el("p", { text: copy }),
      ]),
    );
  });
}
