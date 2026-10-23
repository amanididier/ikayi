import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, BookUser, HandCoins, Cloud, Smartphone } from "lucide-react";
import logo from "@/assets/ikayi-logo.png";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Ikayi | Ikayi y'amadeni yawe" },
      { name: "description", content: "Andika abakiriya barimo amadeni n'abo mubereyemo. Offline-first, cloud sync." },
      { property: "og:title", content: "Ikayi | Ikayi y'amadeni yawe" },
      { property: "og:description", content: "Ikayi y'amadeni n'ubwishyu kuri telefone yawe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomePage,
});

const APK_URL =
  "https://github.com/amanididier/ikayi/releases/download/android-latest/ikayi.apk";

function WelcomePage() {
  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-[#382B24]">
      <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="size-10 rounded-xl" />
          <span className="text-lg font-bold">Ikayi</span>
        </div>
        <Link to="/" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Fungura app
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-5 pb-16 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ikayi y'amadeni</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">
          Andika amadeni yawe mu buryo bworoshye
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Abantu barimo amadeni, abo mubereyemo, na cloud sync kuri telefone nyinshi. Nta POS, nta stock —
          amadeni gusa.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={APK_URL}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-card"
          >
            <Download className="size-5" />
            Manura app (Android APK)
          </a>
          <Link
            to="/install-android"
            className="flex h-12 items-center justify-center gap-2 rounded-full border bg-card text-sm font-semibold"
          >
            <Smartphone className="size-4" />
            Uko washyiramo kuri Android
          </Link>
          <Link
            to="/"
            className="flex h-12 items-center justify-center rounded-full text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            Koresha muri browser
          </Link>
        </div>

        <ul className="mt-10 space-y-4">
          {[
            { icon: BookUser, title: "Barandenze", body: "Abakiriya bagufitiye amadeni — andika, wishyure, wohereze WhatsApp." },
            { icon: HandCoins, title: "Ndenze", body: "Abo mubereyemo — menya balance n'amateka." },
            { icon: Cloud, title: "Cloud sync", body: "Telefone ebyiri, konti imwe — amakuru ahura." },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Ikayi · Born from Stoke Yange credit book
        </p>
      </main>
    </div>
  );
}
