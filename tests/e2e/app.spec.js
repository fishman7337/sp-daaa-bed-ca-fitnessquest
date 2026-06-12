const { expect, test } = require("@playwright/test");

async function login(page) {
  await page.goto("/loginRegister.html");
  await page.getByLabel("Username").first().fill("John Doe");
  await page.getByLabel("Password").first().fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/homepage\.html/);
}

test("landing, login, and dashboard render", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "FitnessQuest" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Command centre" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "John Doe" })).toBeVisible();
});

test("challenge and review flow works", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Challenges" }).click();
  await page.getByLabel("Challenge").first().fill("Playwright plank challenge");
  await page.getByLabel("Skillpoints").first().fill("25");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Challenge created.")).toBeVisible();
  await page.getByRole("button", { name: "Open" }).last().click();
  await page.getByLabel("Review rating").fill("5");
  await page.getByRole("button", { name: "Save review" }).click();
  await expect(page.getByText("Review saved.")).toBeVisible();
});

test("mobile viewport keeps navigation visible", async ({ page, isMobile }) => {
  await page.setViewportSize(
    isMobile ? { width: 390, height: 844 } : { width: 430, height: 820 },
  );
  await login(page);
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.getByRole("link", { name: "Inventory" })).toBeVisible();
});
