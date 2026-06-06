/**
 * Pure PWA install helpers. The component layer wires these to real browser
 * signals (`beforeinstallprompt`, `display-mode`, `navigator.standalone`) but
 * all the decision logic lives here so it can be unit-tested.
 */

export type Platform = "ios" | "android" | "desktop";

/** Finer-grained device for tailoring install copy (the iPad Share icon lives
 *  in a different place than the iPhone one, etc.). */
export type Device = "iphone" | "ipad" | "android" | "desktop";

/**
 * Best-effort platform from a user-agent. `maxTouchPoints` catches iPadOS 13+,
 * which reports a desktop-Safari "Macintosh" UA but has a touch screen.
 */
export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  const s = (ua || "").toLowerCase();
  if (/iphone|ipad|ipod/.test(s)) return "ios";
  if (/macintosh/.test(s) && maxTouchPoints > 1) return "ios"; // iPad on iPadOS 13+
  if (/android/.test(s)) return "android";
  return "desktop";
}

/** Distinguish iPhone vs iPad (and Android/desktop) so instructions can match. */
export function detectDevice(ua: string, maxTouchPoints = 0): Device {
  const s = (ua || "").toLowerCase();
  if (/ipad/.test(s)) return "ipad";
  if (/macintosh/.test(s) && maxTouchPoints > 1) return "ipad"; // iPadOS 13+ desktop UA
  if (/iphone|ipod/.test(s)) return "iphone";
  if (/android/.test(s)) return "android";
  return "desktop";
}

export function isIos(ua: string, maxTouchPoints = 0): boolean {
  return detectPlatform(ua, maxTouchPoints) === "ios";
}

export function isAndroid(ua: string): boolean {
  return detectPlatform(ua) === "android";
}

export function isStandalone(opts: {
  displayModeStandalone?: boolean;
  navigatorStandalone?: boolean;
}): boolean {
  return Boolean(opts.displayModeStandalone || opts.navigatorStandalone);
}

export type InstallMode = "native" | "ios-instructions" | "android-instructions" | "none";

export interface InstallState {
  platform: Platform;
  standalone: boolean;
  /** a captured beforeinstallprompt event is available */
  hasNativePrompt: boolean;
}

/**
 * Decide whether/how to show the install affordance:
 *  - already installed -> nothing
 *  - native prompt captured (Android/Chromium desktop) -> one-tap install
 *  - iOS Safari (no prompt API) -> show the manual Add-to-Home-Screen sheet
 *  - Android without a prompt (Firefox, Samsung Internet, or before the event
 *    fires) -> show the manual "browser menu -> Install app" sheet
 */
export function installAvailability(state: InstallState): {
  canInstall: boolean;
  mode: InstallMode;
} {
  if (state.standalone) return { canInstall: false, mode: "none" };
  if (state.hasNativePrompt) return { canInstall: true, mode: "native" };
  if (state.platform === "ios") return { canInstall: true, mode: "ios-instructions" };
  if (state.platform === "android") return { canInstall: true, mode: "android-instructions" };
  return { canInstall: false, mode: "none" };
}

export function installHint(platform: Platform): string {
  switch (platform) {
    case "ios":
      return "Tap the Share icon, then choose “Add to Home Screen”.";
    case "android":
      return "Tap Install to add goread to your home screen.";
    default:
      return "Install goread from the icon in your browser’s address bar.";
  }
}
