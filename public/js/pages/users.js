import { api, wireLogout } from "../shared/api.js";
import { byId, renderTable } from "../shared/dom.js";

wireLogout();

const users = await api("/users");
renderTable(
  byId("users-table"),
  [
    { key: "username", label: "Player" },
    { key: "level", label: "Level" },
    { key: "skillpoints", label: "Skillpoints" },
    { key: "currency", label: "Currency" },
    { key: "total_battles_won", label: "Battles Won" },
  ],
  users,
);
