/** Browser vs installed-app entry mode (same as Stoke Yange). */
import { Capacitor } from "@capacitor/core";

const KEY = "iy-app-mode";

/** True inside Android/iOS Capacitor WebView. */
export function isNativePlatform(): boolean {
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    /* SSR / no bridge yet */
  }
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.() === true) return true;
  if (cap?.getPlatform?.() === "android" || cap?.getPlatform?.() === "ios") return true;
  const ua = navigator.userAgent || "";
  if (/; wv\)/i.test(ua)) return true;
  // Native SPA bundle flag from vite.native.config
  if (import.meta.env.VITE_NATIVE === "1") return true;
  return false;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativePlatform()) return true;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ios = (window.navigator as any).standalone === true;
  return mq || ios;
}

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

/** True → credit book. False → marketing /welcome (browser only). */
export function isAppMode(): boolean {
  if (isNativePlatform()) {
    enterAppMode();
    return true;
  }
  return isStandalone() || preferApp();
}
