const TOKEN_KEY = "fitnessquest_token";
const LEGACY_TOKEN_KEY = "token";

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem("user_id");
}

export async function api(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with ${response.status}`,
    );
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export async function currentUser() {
  return api("/auth/me");
}

export async function requireLogin() {
  try {
    return await currentUser();
  } catch (error) {
    clearSession();
    window.location.href = "loginRegister.html";
    return null;
  }
}

export function wireLogout(selector = "[data-logout]") {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      clearSession();
      window.location.href = "index.html";
    });
  });
}
