import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookUser, HandCoins, Settings2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isLoggedIn } from "@/lib/auth";
import { enterAppMode, isAppMode } from "@/lib/app-mode";
import { AuthCard } from "./AuthCard";
import logo from "@/assets/ikayi-logo.png";

/**
 * App chrome: header + content + Stoke-style floating bottom pill nav.
 * Layout matches lovable-sync / Stoke Yange — do not rename bottom-nav class.
 */
export function Shell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [online, setOnline] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const isLanding =
    path === "/welcome" ||
    path.startsWith("/welcome/") ||
    path === "/install-android" ||
    path.startsWith("/install-android/");

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
    void isLoggedIn()
      .then((ok) => {
        if (!cancelled) {
          setAuthed(ok || sessionStorage.getItem("ikayi-device-mode") === "1");
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthed(sessionStorage.getItem("ikayi-device-mode") === "1");
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
    return (
      <div className="app-shell flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <img src={logo} alt="" className="size-16 rounded-2xl shadow-sm" />
        <h1 className="text-lg font-bold tracking-tight">Ikayi Yange</h1>
        <p className="text-xs text-muted-foreground">
          {lang === "rw" ? "Tegereza…" : "Loading…"}
        </p>
        <div className="ikayi-startup-track mt-2 w-40" aria-hidden="true">
          <span className="is-loading" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight">Ikayi Yange</h1>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {online ? (
                <Wifi className="size-3 shrink-0 text-emerald-600" />
              ) : (
                <WifiOff className="size-3 shrink-0" />
              )}
              <span className="truncate">
                {online
                  ? lang === "rw"
                    ? "Online"
                    : "Online"
                  : lang === "rw"
                    ? "Nta murandasi"
                    : "Offline"}
              </span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 gap-0 rounded-full bg-card p-0.5"
          aria-label="Toggle language"
          onClick={() => setLang(lang === "rw" ? "en" : "rw")}
        >
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            EN
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              lang === "rw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            RW
          </span>
        </Button>
      </header>

      <main className="px-4 pb-32 pt-3">{authed ? children : null}</main>

      <nav className="bottom-nav" aria-label={lang === "rw" ? "Paji" : "Main navigation"}>
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Button
              asChild
              key={to}
              variant="ghost"
              className={`h-12 rounded-full ${
                active
                  ? "flex-[2] bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                  : "flex-1 text-ink-foreground/70 hover:bg-ink hover:text-ink-foreground"
              }`}
            >
              <Link to={to} aria-label={label} aria-current={active ? "page" : undefined}>
                <Icon className="size-5 shrink-0" />
                {active && <span className="truncate text-sm font-semibold">{label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>

      {!authed && <AuthCard onAuthed={onAuthed} onOffline={onOffline} />}
    </div>
  );
}
