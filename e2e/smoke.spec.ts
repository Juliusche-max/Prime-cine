import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page loads and shows the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Prime Ciné/);
    await expect(page.getByRole("link", { name: /Prime Ciné - Accueil/i })).toBeVisible();
  });

  test("navigating to Movies shows a page heading", async ({ page }) => {
    await page.goto("/movies");
    await expect(page.getByRole("heading", { name: "Films" })).toBeVisible();
  });

  test("navigating to Series shows a page heading", async ({ page }) => {
    await page.goto("/series");
    await expect(page.getByRole("heading", { name: "Séries" })).toBeVisible();
  });

  test("login page renders the form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
  });

  test("pricing page lists at least one plan or an empty state", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /abonnement/i })).toBeVisible();
  });

  test("unauthenticated user is redirected away from /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unknown route shows the custom 404 page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
  });
});
