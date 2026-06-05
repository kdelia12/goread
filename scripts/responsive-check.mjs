import { chromium, devices } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3220";
const widths = [320, 360, 375, 414, 768, 1024, 1280, 1440, 1920];
const paths = ["/", "/search?q=a", "/book/1342", "/library", "/read/1342"];

const browser = await chromium.launch();
let problems = 0;

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(350);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    const bad = overflow > 2;
    if (bad) problems++;
    console.log(`${bad ? "OVERFLOW" : "ok      "} w=${String(w).padStart(4)}  ${p}  (+${overflow}px)`);
  }
  await ctx.close();
}

const ctx = await browser.newContext(devices["iPhone SE"]);
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "shots/home-iphone-se.png" });
await ctx.close();

await browser.close();
console.log(problems === 0 ? "\nALL OK: no horizontal overflow at any width" : `\n${problems} overflow issue(s)`);
