import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 860 } });

await page.goto(base + "/read/1342", { waitUntil: "networkidle" });
// wait for the chapter indicator "n / N" to appear (spine parsed)
await page
  .waitForFunction(
    () => [...document.querySelectorAll("span")].some((s) => /\d+\s*\/\s*\d+/.test(s.textContent || "")),
    { timeout: 40000 },
  )
  .catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: "shots/reader.png" });
console.log("shot reader.png");

await page.getByRole("button", { name: "Settings" }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: "shots/reader-settings.png" });
console.log("shot reader-settings.png");

await browser.close();
