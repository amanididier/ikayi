import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isLoggedIn } from "@/lib/auth";
import { AuthCard } from "./AuthCard";
import logo from "@/assets/ikayi-logo.png";

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
    void isLoggedIn().then((ok) => {
      if (!cancelled) {
        setAuthed(ok);
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
    { to: "/" as const, label: t("owesMe"), icon: ArrowDownLeft },
    { to: "/i-owe" as const, label: t("iOwe"), icon: ArrowUpRight },
    { to: "/settings" as const, label: t("settings"), icon: Settings },
  ];

  if (isLanding) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="app-shell flex min-h-dvh flex-col items-center justify-center">
        <img src={logo} alt="" className="mb-4 size-16 rounded-2xl" />
        <p className="text-sm font-semibold">Ikayi</p>
        <p className="mt-2 text-xs text-muted-foreground">{lang === "rw" ? "Tegereza…" : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="size-11 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold">Ikayi</h1>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {online ? <Wifi className="size-3 text-success" /> : <WifiOff className="size-3" />}
              {t(online ? "online" : "offline")} · {lang === "rw" ? "Kuri iyi telefone" : "On this device"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-9 gap-0 rounded-full bg-card p-0.5"
          aria-label="Toggle language"
          onClick={() => setLang(lang === "rw" ? "en" : "rw")}
        >
          <span className={`rounded-full px-2.5 py-1 text-[11px] ${lang === "en" ? "bg-primary text-primary-foreground" : ""}`}>EN</span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] ${lang === "rw" ? "bg-primary text-primary-foreground" : ""}`}>RW</span>
        </Button>
      </header>

      <main className="px-4 pb-32 pt-3">{children}</main>

      <nav className="bottom-nav" aria-label={lang === "rw" ? "Paji" : "Main navigation"}>
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = path === to;
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
