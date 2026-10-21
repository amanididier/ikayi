import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookUser,
  Cloud,
  Download,
  HandCoins,
  Smartphone,
  WifiOff,
  Zap,
} from "lucide-react";
import logo from "@/assets/ikayi-logo.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Ikayi Yange | Ikayi y'amadeni yawe" },
      {
        name: "description",
        content:
          "Ikayi Yange ni application yo gucunga amadeni n'ubwishyu. Barandenze, ndenze, cloud sync. Ikora nta murandasi.",
      },
      { property: "og:title", content: "Ikayi Yange | Ikayi y'amadeni yawe" },
      { property: "og:locale", content: "rw_RW" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WelcomePage,
});

type Lang = "en" | "rw";

const copy = {
  en: {
    heroTitle: "Your credit book, on your phone",
    heroSub: "For businesses and people who track debts.",
    heroSub2: "Works online and offline.",
    install: "Install app",
    open: "Open app",
    androidDownload: "Android install guide",
    featuresTitle: "What Ikayi Yange does",
    featuresSub: "Only the credit tools people actually use.",
    howTitle: "How it works",
    howSub: "Three steps. Ready in minutes.",
    ctaTitle: "Start free today",
    ctaSub: "Install once. Your debts stay on your phone and sync when online.",
    footer: "Ikayi Yange · Your credit book",
    contact: "Help",
    f1t: "Who owes you",
    f1d: "Customers and their balances, history, reminders.",
    f2t: "Who you owe",
    f2d: "Suppliers and people you still need to pay.",
    f3t: "Works offline",
    f3d: "No signal? Keep writing. Sync later.",
    f4t: "Cloud sync",
    f4d: "Same account on two phones — data stays in sync.",
    s1t: "Install",
    s1d: "Add Ikayi Yange to your phone.",
    s2t: "Add people",
    s2d: "Debtors and creditors with optional deadlines.",
    s3t: "Track & sync",
    s3d: "Record payments. Share the same business account.",
    offlineTitle: "No internet? No problem.",
    offlineBody: "Debts and payments save on your phone. When you connect, they go to the cloud.",
    roadmapTitle: "Roadmap",
    r1: "Credit book (owes me / I owe)",
    r2: "Cloud sync across phones",
    r3: "Android APK install",
    r4: "WhatsApp reminders",
    lang: "Language",
  },
  rw: {
    heroTitle: "Ikayi y'amadeni yawe, kuri telefone",
    heroSub: "Ku bantu n'amaduka bakurikirana amadeni.",
    heroSub2: "Ikora iyo ufite murandasi n'iyo utayifite.",
    install: "Shyiramo app",
    open: "Fungura app",
    androidDownload: "Uko ushyiramo kuri Android",
    featuresTitle: "Ibyo Ikayi Yange ikora",
    featuresSub: "Ibikoresho by'amadeni abantu bakoresha koko.",
    howTitle: "Uko bikora",
    howSub: "Intambwe eshatu. Umererwa neza vuba.",
    ctaTitle: "Tangira ubuntu uyu munsi",
    ctaSub: "Shyiramo rimwe. Amadeni abikwa kuri telefone kandi ahura iyo uhujwe.",
    footer: "Ikayi Yange · Ikayi y'amadeni yawe",
    contact: "Ubufasha",
    f1t: "Barandenze",
    f1d: "Abakiriya n'asigaye, amateka, n'ibibutsa.",
    f2t: "Ndenze",
    f2d: "Abo mubereyemo — menya balance n'ubwishyu.",
    f3t: "Ikora nta murandasi",
    f3d: "Nta signal? Komeza wandika. Sync nyuma.",
    f4t: "Cloud sync",
    f4d: "Konti imwe, telefone ebyiri — amakuru ahura.",
    s1t: "Shyiramo",
    s1d: "Ongeraho Ikayi Yange kuri telefone yawe.",
    s2t: "Ongeraho abantu",
    s2d: "Barandenze n'abo mubereyemo, n'igihe niba ushaka.",
    s3t: "Kurikirana & sync",
    s3d: "Andika ubwishyu. Koresha konti imwe y'ubucuruzi.",
    offlineTitle: "Nta murandasi? Nta kibazo.",
    offlineBody: "Amadeni n'ubwishyu bibikwa kuri telefone. Iyo uhujwe, bijya kuri cloud.",
    roadmapTitle: "Uko tugiye",
    r1: "Ikayi y'amadeni (barandenze / ndenze)",
    r2: "Cloud sync kuri telefone nyinshi",
    r3: "Gushyiramo APK ya Android",
    r4: "Ibutsa kuri WhatsApp",
    lang: "Ururimi",
  },
} as const;

const ANDROID_APK_URL =
  "https://github.com/amanididierprofessional/ikayi/releases/download/android-latest/ikayi-yange.apk";

function WelcomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("rw");
  const t = copy[lang];

  useEffect(() => {
    const saved = localStorage.getItem("iy-lang");
    if (saved === "en" || saved === "rw") setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("iy-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const goApp = () => navigate({ to: "/" });

  const features = [
    { icon: BookUser, title: t.f1t, body: t.f1d, tone: "bg-orange-50 text-orange-600" },
    { icon: HandCoins, title: t.f2t, body: t.f2d, tone: "bg-amber-50 text-amber-700" },
    { icon: WifiOff, title: t.f3t, body: t.f3d, tone: "bg-sky-50 text-sky-700" },
    { icon: Cloud, title: t.f4t, body: t.f4d, tone: "bg-emerald-50 text-emerald-700" },
  ];

  const steps = [
    { n: "1", title: t.s1t, body: t.s1d, icon: Download },
    { n: "2", title: t.s2t, body: t.s2d, icon: BookUser },
    { n: "3", title: t.s3t, body: t.s3d, icon: Zap },
  ];

  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-foreground">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FAF8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={logo} alt="" className="size-9 rounded-xl" />
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">Ikayi Yange</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full border bg-white p-0.5 shadow-sm" aria-label={t.lang}>
              <button type="button" onClick={() => setLang("en")} className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                EN
              </button>
              <button type="button" onClick={() => setLang("rw")} className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", lang === "rw" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                RW
              </button>
            </div>
            <button type="button" onClick={goApp} className="hidden h-9 items-center rounded-full bg-primary px-3 text-[11px] font-bold text-primary-foreground sm:inline-flex">
              {t.open}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ikayi Yange</p>
        <h1 className="mt-2 max-w-xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">{t.heroTitle}</h1>
        <p className="mt-3 max-w-lg text-pretty text-base text-muted-foreground sm:text-lg">
          {t.heroSub}<br />{t.heroSub2}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a href={ANDROID_APK_URL} className="inline-flex min-h-13 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-card sm:w-auto">
            <Download className="size-5 shrink-0" /><span>{t.install}</span>
          </a>
          <Link to="/install-android" className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border bg-card px-5 py-3 text-sm font-semibold sm:w-auto">
            <Smartphone className="size-4" />{t.androidDownload}
          </Link>
          <button type="button" onClick={goApp} className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full text-sm font-semibold text-primary underline-offset-2 hover:underline sm:w-auto">
            {t.open}
          </button>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white/60 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.featuresTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.featuresSub}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body, tone }) => (
              <li key={title} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tone)}><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <p className="font-bold">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.howTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.howSub}</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map(({ n, title, body, icon: Icon }) => (
            <li key={n} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</span>
                <Icon className="size-5 text-primary" />
              </div>
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-black/5 bg-primary/5 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700"><WifiOff className="size-6" /></span>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{t.offlineTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.offlineBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="text-2xl font-bold tracking-tight">{t.roadmapTitle}</h2>
        <ul className="mt-6 space-y-3">
          {[t.r1, t.r2, t.r3, t.r4].map((item, i) => (
            <li key={item} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-black/5 bg-white/70 py-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">{t.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t.ctaSub}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href={ANDROID_APK_URL} className="inline-flex min-h-13 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground sm:w-auto">
              <Download className="size-5" />{t.install}
            </a>
            <Link to="/install-android" className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold sm:w-auto">
              <Smartphone className="size-4" />{t.androidDownload}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <p>{t.footer}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className="mr-1 font-medium">{t.contact}:</span>
            <a href="tel:0796919900" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 font-semibold text-primary">
              <Smartphone className="size-4" />0796 919 900
            </a>
            <a href="https://wa.me/250796919900" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#128C7E] px-4 py-2 font-semibold text-white">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
