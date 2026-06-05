import { chromium, devices } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3220";
const browser = await chromium.launch();
const ctx = await browser.newContext(devices["iPhone SE"]);
const page = await ctx.newPage();

const failed = [];
page.on("requestfailed", (r) => failed.push(r.url()));
page.on("response", (r) => {
  if (r.url().endsWith(".css") && !r.ok()) failed.push(`${r.status()} ${r.url()}`);
});

await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const info = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  const nav = document.querySelector("nav");
  return {
    bg: cs.backgroundColor,
    fontFamily: cs.fontFamily,
    navDisplay: nav ? getComputedStyle(nav).display : "none",
    stylesheets: document.styleSheets.length,
  };
});

await page.screenshot({ path: "shots/home-iphone-se.png" });
await ctx.close();
await browser.close();

console.log("computed body bg :", info.bg);
console.log("computed font    :", info.fontFamily);
console.log("nav display      :", info.navDisplay, "(should be 'none' at 375px)");
console.log("stylesheets      :", info.stylesheets);
console.log("failed requests  :", failed.length ? failed : "none");
const styled = info.bg !== "rgba(0, 0, 0, 0)" && info.bg !== "transparent";
console.log(styled ? "RESULT: STYLED ✓" : "RESULT: UNSTYLED ✗");
