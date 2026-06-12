import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, card, el, renderCards, setStatus } from "../shared/dom.js";

await requireLogin();
wireLogout();

let pets = [];
let foods = [];
let selectedPet;

function renderPets() {
  renderCards(
    byId("pet-list"),
    pets,
    (pet) => {
      const select = el("button", { type: "button", text: "Select" });
      select.addEventListener("click", () => {
        selectedPet = pet;
        byId("selected-pet").textContent = pet.name;
        byId("selected-pet-meta").textContent =
          `Level ${pet.level}, XP ${pet.experience}, HP ${pet.health}, ATK ${pet.attack_power}`;
      });
      return card(
        pet.name,
        [
          `Level: ${pet.level}`,
          `Experience: ${pet.experience}`,
          `Health: ${pet.health}`,
          `Attack: ${pet.attack_power}`,
        ],
        [select],
      );
    },
    "No pets yet.",
  );
}

async function loadPets() {
  pets = await api("/pets");
  renderPets();
}

async function loadFoods() {
  foods = (await api("/items")).filter((item) => item.type === "Food");
  const select = byId("food-select");
  select.replaceChildren();
  foods.forEach((food) => {
    select.appendChild(el("option", { value: food.item_id, text: food.name }));
  });
}

byId("create-pet-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("pet-status");
  try {
    await api("/pets", {
      method: "POST",
      body: { name: byId("pet-name").value },
    });
    event.target.reset();
    setStatus(status, "Pet created.");
    await loadPets();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("feed-pet").addEventListener("click", async () => {
  const status = byId("pet-status");
  try {
    if (!selectedPet) throw new Error("Select a pet first");
    const updated = await api("/pets/feed", {
      method: "POST",
      body: {
        pet_id: selectedPet.pet_id,
        item_id: byId("food-select").value,
      },
    });
    selectedPet = updated;
    setStatus(status, "Pet fed.");
    await loadPets();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("level-pet").addEventListener("click", async () => {
  const status = byId("pet-status");
  try {
    if (!selectedPet) throw new Error("Select a pet first");
    selectedPet = await api("/pets/level-up", {
      method: "POST",
      body: { pet_id: selectedPet.pet_id },
    });
    setStatus(status, "Pet level updated.");
    await loadPets();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

await loadFoods();
await loadPets();
