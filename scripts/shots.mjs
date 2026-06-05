import { chromium, devices } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3210";
const browser = await chromium.launch();

async function shot(path, url, { theme, device, viewport } = {}) {
  const opts = device
    ? { ...devices[device] }
    : { viewport: viewport ?? { width: 1280, height: 880 } };
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  if (theme) await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(base + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path });
  await ctx.close();
  console.log("shot", path);
}

// desktop
await shot("shots/home-light.png", "/");
await shot("shots/home-sepia.png", "/", { theme: "sepia" });
await shot("shots/home-dark.png", "/", { theme: "dark" });
await shot("shots/book.png", "/book/1342");
await shot("shots/library-dark.png", "/library", { theme: "dark" });
await shot("shots/home-wide.png", "/", { viewport: { width: 1600, height: 1000 } });
// tablet
await shot("shots/home-tablet.png", "/", { device: "iPad Mini" });
await shot("shots/search-tablet.png", "/search?q=a", { device: "iPad Mini" });
// phone
await shot("shots/home-mobile.png", "/", { device: "iPhone 13" });
await shot("shots/book-mobile.png", "/book/1342", { device: "iPhone 13" });

await browser.close();
console.log("done");
