/** Browser vs installed-app entry mode (same idea as Stoke Yange). */

const KEY = "iy-app-mode";

/** Running as installed PWA / home screen / native WebView. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  // iOS Safari
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
  return isStandalone() || preferApp();
}
