import { test, expect } from "@playwright/test";

test("home renders the featured hero and trending rail", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Featured today")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trending now" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start reading/ })).toBeVisible();
});

test("search returns matching books", async ({ page }) => {
  await page.goto("/search?q=frankenstein");
  await expect(page.getByRole("heading", { name: /Frankenstein/i }).first()).toBeVisible();
});

test("theme switcher updates the data-theme attribute", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Change reading theme" }).click();
  await page.getByRole("menuitemradio", { name: /Sepia/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sepia");
});

test("book detail page shows the book and actions", async ({ page }) => {
  await page.goto("/book/1342");
  await expect(page.getByRole("heading", { name: "Pride and Prejudice" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start reading/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Save/ })).toBeVisible();
});

test("reader shell loads with its toolbar", async ({ page }) => {
  await page.goto("/read/1342");
  await expect(page.getByRole("link", { name: "Back to book" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
});

test("library page renders its sections in guest mode", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Your library" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saved", exact: true })).toBeVisible();
});
