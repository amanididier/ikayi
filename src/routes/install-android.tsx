import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

export const Route = createFileRoute("/install-android")({
  head: () => ({
    meta: [{ title: "Uko washyiramo Ikayi Yange kuri Android" }],
  }),
  component: InstallAndroid,
});

const APK_URL =
  "https://github.com/amanididierprofessional/ikayi/releases/download/android-latest/ikayi-yange.apk";

function InstallAndroid() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#FAF8F5] px-5 pb-16 pt-4 text-[#382B24]">
      <Link to="/welcome" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" /> Subira
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">Android · intambwe 4</p>
      <h1 className="mt-2 text-2xl font-bold leading-tight">Manura, hanyuma ushyiremo Ikayi Yange</h1>
      <a
        href={APK_URL}
        className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground"
      >
        <Download className="size-5" /> Manura app ubu
      </a>
      <ol className="mt-8 space-y-4 text-sm">
        {[
          "Kanda “Manura app ubu”. Tegereza download irangire (ikayi-yange.apk).",
          "Fungura dosiye muri Downloads / Files.",
          "Niba telefone ibisaba, emerera “Install unknown apps” kuri browser yawe.",
          "Kanda Install, hanyuma Open — Ikayi Yange iratangiye.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Emera gusa dosiye ya Ikayi Yange yakuye kuri iyi link. Ntabwo ari Play Store (beta APK).
      </p>
    </div>
  );
}
