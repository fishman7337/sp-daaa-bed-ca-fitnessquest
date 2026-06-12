import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, card, el, renderCards, setStatus } from "../shared/dom.js";

await requireLogin();
wireLogout();

async function loadQuests() {
  const quests = await api("/quests");
  renderCards(
    byId("quest-list"),
    quests,
    (quest) => {
      const attempt = el("button", { type: "button", text: "Attempt" });
      attempt.addEventListener("click", async () => {
        const status = byId("quest-status");
        try {
          await api(`/quests/${quest.quest_id}/attempt`, { method: "POST" });
          setStatus(status, "Quest completed and rewards granted.");
        } catch (error) {
          setStatus(status, error.message, true);
        }
      });
      return card(
        quest.name,
        [
          quest.description,
          `Required level: ${quest.required_user_level}`,
          `Reward: ${quest.reward_xp} XP, ${quest.reward_currency} coins`,
        ],
        [attempt],
      );
    },
    "No quests found.",
  );
}

await loadQuests();
