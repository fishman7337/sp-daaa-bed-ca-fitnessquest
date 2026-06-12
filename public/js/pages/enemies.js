import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, card, el, renderCards, setStatus } from "../shared/dom.js";

await requireLogin();
wireLogout();

let selectedEnemy;
let selectedPet;

async function loadEnemies() {
  const enemies = await api("/enemies");
  renderCards(
    byId("enemy-list"),
    enemies,
    (enemy) => {
      const select = el("button", { type: "button", text: "Target" });
      select.addEventListener("click", () => {
        selectedEnemy = enemy;
        byId("selected-enemy").textContent = enemy.name;
      });
      return card(
        enemy.name,
        [
          `Health: ${enemy.health}`,
          `Attack: ${enemy.attack_power}`,
          `Reward: ${enemy.reward_xp} XP, ${enemy.reward_currency} coins`,
        ],
        [select],
      );
    },
    "No enemies found.",
  );
}

async function loadPetOptions() {
  const pets = await api("/pets");
  const select = byId("pet-select");
  select.replaceChildren();
  pets.forEach((pet) => {
    select.appendChild(
      el("option", {
        value: pet.pet_id,
        text: `${pet.name} (Lv ${pet.level})`,
      }),
    );
  });
  selectedPet = pets[0];
  select.addEventListener("change", () => {
    selectedPet = pets.find((pet) => String(pet.pet_id) === select.value);
  });
}

byId("fight-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("battle-status");
  try {
    if (!selectedEnemy) throw new Error("Select an enemy first");
    const result = await api("/battles/fight", {
      method: "POST",
      body: {
        pet_id: selectedPet?.pet_id || byId("pet-select").value,
        enemy_id: selectedEnemy.enemy_id,
      },
    });
    setStatus(
      status,
      `Result: ${result.result}. Earned ${result.xp_earned} XP and ${result.currency_earned} coins.`,
    );
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

await loadPetOptions();
await loadEnemies();
