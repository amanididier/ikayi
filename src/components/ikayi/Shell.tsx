import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookUser, HandCoins, Settings2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isLoggedIn } from "@/lib/auth";
import { enterAppMode, isAppMode } from "@/lib/app-mode";
import { AuthCard } from "./AuthCard";
import logo from "@/assets/ikayi-logo.png";

export function Shell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [online, setOnline] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [startupStage, setStartupStage] = useState<"opening" | "checking" | "ready">("opening");
  const isLanding =
    path === "/welcome" ||
    path.startsWith("/welcome/") ||
    path === "/install-android" ||
    path.startsWith("/install-android/");

  useEffect(() => {
    // Hand off from HTML boot splash to React branded loader (or app)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__ikayiHideBoot?.();
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    if (isAppMode()) enterAppMode();
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStartupStage("checking");
    void isLoggedIn()
      .then((ok) => {
        if (!cancelled) {
          setAuthed(ok);
          setStartupStage("ready");
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthed(false);
          setStartupStage("ready");
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onAuthed = useCallback(() => setAuthed(true), []);
  const onOffline = useCallback(() => {
    sessionStorage.setItem("ikayi-device-mode", "1");
    setAuthed(true);
  }, []);

  const tabs = [
    { to: "/" as const, label: t("owesMe"), icon: BookUser },
    { to: "/i-owe" as const, label: t("iOwe"), icon: HandCoins },
    { to: "/settings" as const, label: t("settings"), icon: Settings2 },
  ];

  if (isLanding) {
    return <>{children}</>;
  }

  if (checking) {
    const status =
      startupStage === "opening"
        ? lang === "rw"
          ? "Turafungura Ikayi Yange…"
          : "Opening Ikayi Yange…"
        : lang === "rw"
          ? "Turategura amakuru yawe…"
          : "Getting your account ready…";

    return (
      <main
        className="ikayi-startup"
        role="status"
        aria-live="polite"
        aria-label={lang === "rw" ? "Gufungura Ikayi Yange" : "Opening Ikayi Yange"}
      >
        <div className="ikayi-startup-content">
          <img src={logo} alt="Ikayi Yange" className="ikayi-startup-logo" />
          <h1 className="ikayi-startup-title">Ikayi Yange</h1>
          <p className="ikayi-startup-description">
            {lang === "rw"
              ? "Ikayi y'amadeni n'ubwishyu bwawe."
              : "Your simple book for debts and payments."}
          </p>
          <div className="ikayi-startup-track" aria-hidden="true">
            <span className={startupStage === "ready" ? "is-ready" : "is-loading"} />
          </div>
          <p className="ikayi-startup-status">{status}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="size-11 rounded-xl" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight">Ikayi Yange</h1>
            <p className="text-[11px] text-muted-foreground">
              {online ? (
                <span className="inline-flex items-center gap-1">
                  <Wifi className="size-3" />
                  {lang === "rw" ? "Online" : "Online"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <WifiOff className="size-3" />
                  {lang === "rw" ? "Nta murandasi" : "Offline"}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("rw")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              lang === "rw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            RW
          </button>
        </div>
      </header>

      <div className="app-main">{authed ? children : <AuthCard onAuthed={onAuthed} onOffline={onOffline} />}</div>

      {authed && (
        <nav className="app-bottom-nav" aria-label="Main">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="max-w-full truncate px-0.5">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
