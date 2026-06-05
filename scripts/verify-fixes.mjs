import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 880 } });

// #2 — genre browse
await page.goto(base + "/search?topic=gothic", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const genreChips = await page.getByRole("link", { name: "Gothic", exact: true }).count();
await page.screenshot({ path: "shots/genre-browse.png" });
console.log("#2 genre chips present:", genreChips > 0);

// #3 — reader links neutralised (Crime and Punishment = 2554)
await page.goto(base + "/read/2554", { waitUntil: "networkidle" });
await page
  .waitForFunction(
    () => {
      const f = document.querySelector("iframe");
      return f?.contentDocument?.body && f.contentDocument.body.textContent.trim().length > 50;
    },
    { timeout: 45000 },
  )
  .catch(() => {});
await page.waitForTimeout(1500);
const links = await page.evaluate(() => {
  const doc = document.querySelector("iframe")?.contentDocument;
  if (!doc) return { ready: false };
  const all = doc.querySelectorAll("a").length;
  const withHref = doc.querySelectorAll("a[href]").length;
  const pe = doc.querySelector("a") ? getComputedStyle(doc.querySelector("a")).pointerEvents : "n/a";
  return { ready: true, anchors: all, withHref, pointerEvents: pe };
});
console.log("#3 reader links:", JSON.stringify(links));
await page.screenshot({ path: "shots/reader-cp.png" });

// #4 — continuous scroll toggle
await page.getByRole("button", { name: "Settings" }).click();
await page.waitForTimeout(500);
const toggle = await page.getByRole("switch", { name: "Continuous scroll" }).count();
await page.screenshot({ path: "shots/reader-settings2.png" });
console.log("#4 continuous toggle present:", toggle > 0);
if (toggle > 0) {
  await page.getByRole("switch", { name: "Continuous scroll" }).click();
  await page.waitForTimeout(2500);
  const bottom = await page.getByText(/continuous scroll/i).count();
  await page.screenshot({ path: "shots/reader-continuous.png" });
  console.log("#4 continuous mode active:", bottom > 0);
}

await browser.close();
console.log("done");
