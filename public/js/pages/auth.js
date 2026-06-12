import { api, saveToken } from "../shared/api.js";
import { byId, setStatus } from "../shared/dom.js";

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function wireForm(formId, endpoint, statusId) {
  const form = byId(formId);
  const status = byId(statusId);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "Working...");
    try {
      const body = formData(form);
      if (body.confirmPassword && body.password !== body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      delete body.confirmPassword;
      const response = await api(endpoint, { method: "POST", body });
      saveToken(response.token);
      window.location.href = "homepage.html";
    } catch (error) {
      setStatus(status, error.message, true);
    }
  });
}

wireForm("login-form", "/auth/login", "login-status");
wireForm("register-form", "/auth/register", "register-status");
