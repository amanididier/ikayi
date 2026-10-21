/** Browser vs installed-app entry mode (same idea as Stoke Yange). */

const KEY = "iy-app-mode";

function isNativeShell(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects this on native APK/iOS builds
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.() === true) return true;
  if (cap?.getPlatform?.() === "android" || cap?.getPlatform?.() === "ios") return true;
  // Android WebView packaged apps often omit browser chrome
  const ua = navigator.userAgent || "";
  if (/; wv\)/i.test(ua) || /\bwv\b/i.test(ua)) return true;
  return false;
}

/** Running as installed PWA / home screen / native WebView. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeShell()) return true;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ios = (window.navigator as any).standalone === true;
  return mq || ios;
}

/** User chose "Open app" or already installed — skip marketing site. */
export function preferApp(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function enterAppMode() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* */
  }
}

/** True → show credit book. False → send user to /welcome. */
export function isAppMode(): boolean {
  // Native APK must NEVER show marketing site
  if (isNativeShell()) {
    enterAppMode();
    return true;
  }
  return isStandalone() || preferApp();
}
