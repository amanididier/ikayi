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
    void isLoggedIn().then((ok) => {
      if (!cancelled) {
        setAuthed(ok);
        setStartupStage("ready");
        setChecking(false);
      }
    }).catch(() => {
      // A local auth lookup failure must never trap the user on the loading screen.
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
    const status = startupStage === "opening"
      ? (lang === "rw" ? "Turafungura Ikayi Yange…" : "Opening Ikayi Yange…")
      : (lang === "rw" ? "Turategura amakuru yawe…" : "Getting your account ready…");

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
              ? "Ikayi y’amadeni n’ubwishyu bwawe."
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
          <div>
            <h1 className="text-xl font-bold">Ikayi Yange</h1>
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
                <Icon className="size-5 shrink-0" strokeWidth={1.75} />
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
