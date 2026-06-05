import { describe, it, expect } from "vitest";
import {
  detectPlatform,
  isIos,
  isAndroid,
  isStandalone,
  installAvailability,
  installHint,
} from "./pwa";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipadOld:
    "Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  ipadOS13Mac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
  desktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
};

describe("detectPlatform", () => {
  it("detects iPhone and classic iPad", () => {
    expect(detectPlatform(UA.iphone)).toBe("ios");
    expect(detectPlatform(UA.ipadOld)).toBe("ios");
  });
  it("detects iPadOS 13+ posing as Macintosh via touch points", () => {
    expect(detectPlatform(UA.ipadOS13Mac, 5)).toBe("ios");
    expect(detectPlatform(UA.ipadOS13Mac, 0)).toBe("desktop"); // can't tell without touch
  });
  it("detects Android and desktop", () => {
    expect(detectPlatform(UA.android)).toBe("android");
    expect(detectPlatform(UA.desktop)).toBe("desktop");
  });
  it("is safe on empty input", () => {
    expect(detectPlatform("")).toBe("desktop");
  });
  it("helpers agree", () => {
    expect(isIos(UA.iphone)).toBe(true);
    expect(isAndroid(UA.android)).toBe(true);
    expect(isIos(UA.android)).toBe(false);
  });
});

describe("isStandalone", () => {
  it("is true for installed PWAs in either signal", () => {
    expect(isStandalone({ displayModeStandalone: true })).toBe(true);
    expect(isStandalone({ navigatorStandalone: true })).toBe(true);
    expect(isStandalone({})).toBe(false);
  });
});

describe("installAvailability", () => {
  it("offers a native one-tap install when a prompt is captured", () => {
    expect(
      installAvailability({ platform: "android", standalone: false, hasNativePrompt: true }),
    ).toEqual({ canInstall: true, mode: "native" });
  });
  it("offers iOS instructions when there is no prompt API", () => {
    expect(
      installAvailability({ platform: "ios", standalone: false, hasNativePrompt: false }),
    ).toEqual({ canInstall: true, mode: "ios-instructions" });
  });
  it("shows nothing once installed", () => {
    expect(
      installAvailability({ platform: "ios", standalone: true, hasNativePrompt: false }),
    ).toEqual({ canInstall: false, mode: "none" });
  });
  it("shows nothing on desktop without a prompt", () => {
    expect(
      installAvailability({ platform: "desktop", standalone: false, hasNativePrompt: false }),
    ).toEqual({ canInstall: false, mode: "none" });
  });
});

describe("installHint", () => {
  it("gives platform-specific guidance", () => {
    expect(installHint("ios")).toMatch(/Add to Home Screen/i);
    expect(installHint("android")).toMatch(/Install/i);
    expect(installHint("desktop")).toMatch(/address bar/i);
  });
});
