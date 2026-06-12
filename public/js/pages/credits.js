import { clearSession } from "../shared/api.js";

document.querySelector("[data-home]")?.addEventListener("click", () => {
  window.location.href = "index.html";
});

document
  .querySelector("[data-clear-session]")
  ?.addEventListener("click", () => {
    clearSession();
  });
