import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

export const Route = createFileRoute("/install-android")({
  head: () => ({
    meta: [
      { title: "Uko washyiramo Ikayi kuri Android" },
      { name: "description", content: "Manura Ikayi ushyire ikayi y'amadeni kuri Android." },
      { property: "og:title", content: "Uko washyiramo Ikayi kuri Android" },
      { property: "og:description", content: "Intambwe zo gushyira Ikayi kuri telefone ya Android." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstallAndroid,
});

const APK_URL =
  "https://github.com/amanididier/ikayi/releases/download/android-latest/ikayi.apk";

function InstallAndroid() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#FAF8F5] px-5 pb-16 pt-4 text-[#382B24]">
      <Link to="/welcome" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" /> Subira
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">Android · intambwe 4</p>
      <h1 className="mt-2 text-2xl font-bold">Manura, hanyuma ushyiremo Ikayi</h1>
      <a
        href={APK_URL}
        className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground"
      >
        <Download className="size-5" /> Manura app ubu
      </a>
      <ol className="mt-8 space-y-4 text-sm">
        {[
          "Kanda \u201cManura app ubu\u201d. Tegereza download irangire (ikayi.apk).",
          "Fungura dosiye muri Downloads / Files.",
          "Niba telefone ibisaba, emerera \u201cInstall unknown apps\u201d kuri browser yawe.",
          "Kanda Install, hanyuma Open \u2014 Ikayi iratangiye.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border bg-card p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-muted-foreground">
        Emera gusa dosiye ya Ikayi yakuye kuri iyi link. Ntabwo ari Play Store (beta APK).
      </p>
    </div>
  );
}
