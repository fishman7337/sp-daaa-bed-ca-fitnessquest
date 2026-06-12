import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, card, el, renderCards, setStatus } from "../shared/dom.js";

await requireLogin();
wireLogout();

async function loadAchievements() {
  const achievements = await api("/achievements");
  renderCards(
    byId("achievement-list"),
    achievements,
    (achievement) => {
      const claim = el("button", { type: "button", text: "Claim" });
      claim.addEventListener("click", async () => {
        const status = byId("achievement-status");
        try {
          await api(`/achievements/${achievement.achievement_id}/claim`, {
            method: "POST",
          });
          setStatus(status, "Achievement claimed.");
        } catch (error) {
          setStatus(status, error.message, true);
        }
      });
      return card(
        achievement.name,
        [
          achievement.description,
          `Requires level ${achievement.level_requirement}, ${achievement.experience_requirement} XP, ${achievement.currency_requirement} coins`,
          `Reward XP: ${achievement.reward_xp}`,
        ],
        [claim],
      );
    },
    "No achievements found.",
  );
}

async function loadMine() {
  const mine = await api("/achievements/me");
  renderCards(
    byId("claimed-list"),
    mine,
    (achievement) =>
      card(achievement.name, [`Claimed: ${achievement.completion_date}`]),
    "No achievements claimed yet.",
  );
}

await loadAchievements();
await loadMine();
