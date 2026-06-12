import { api, requireLogin, wireLogout } from "../shared/api.js";
import { byId, card, el, renderCards, setStatus } from "../shared/dom.js";

await requireLogin();
wireLogout();

let selectedItem;

async function loadItems() {
  const items = await api("/items");
  renderCards(
    byId("item-list"),
    items,
    (item) => {
      const select = el("button", { type: "button", text: "Select" });
      select.addEventListener("click", () => {
        selectedItem = item;
        byId("selected-item").textContent = item.name;
        byId("selected-item-meta").textContent =
          `${item.type} - ${item.rarity} - ${item.cost} coins`;
      });
      return card(
        item.name,
        [`${item.type} - ${item.rarity}`, item.effect, `Cost: ${item.cost}`],
        [select],
      );
    },
    "No catalog items found.",
  );
}

async function loadInventory() {
  const items = await api("/inventory");
  renderCards(
    byId("inventory-list"),
    items,
    (item) =>
      card(item.name, [
        `Quantity: ${item.quantity}`,
        `${item.type} - ${item.rarity}`,
      ]),
    "Inventory is empty.",
  );
}

async function action(endpoint, quantity) {
  if (!selectedItem) {
    throw new Error("Select an item first");
  }
  return api(`/inventory/${endpoint}`, {
    method: "POST",
    body: {
      item_id: selectedItem.item_id,
      quantity,
    },
  });
}

byId("inventory-action-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("inventory-status");
  const form = new FormData(event.target);
  try {
    await action(form.get("mode"), form.get("quantity"));
    setStatus(status, "Inventory updated.");
    await loadInventory();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

await loadItems();
await loadInventory();
