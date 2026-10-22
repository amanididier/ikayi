import { useEffect, useState } from "react";
import { Cloud, LogOut, MessageCircle, Phone, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { clearDevice } from "@/lib/credit-db";
import { getAccount, signOutLocal } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase";
import { fullSync } from "@/lib/sync";
import { useI18n } from "@/lib/i18n";

export function SettingsPage() {
  const { lang, t } = useI18n();
  const rw = lang === "rw";
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [auto, setAuto] = useState(() => localStorage.getItem("ikayi-sync-mode") === "auto");
  const account = typeof window !== "undefined" ? getAccount() : null;

  useEffect(() => {
    localStorage.setItem("ikayi-sync-mode", auto ? "auto" : "manual");
  }, [auto]);

  const syncNow = async () => {
    setSyncing(true);
    try {
      if (!supabaseConfigured) {
        toast.message(rw ? "Shyiramo VITE_SUPABASE_URL n'ANON_KEY kuri Vercel" : "Set VITE_SUPABASE_URL and ANON_KEY on Vercel");
        return;
      }
      if (!navigator.onLine) {
        toast.error(rw ? "Nta interineti" : "You are offline");
        return;
      }
      const result = await fullSync();
      if (result.ok) {
        toast.success(rw ? "Amadeni yahujwe (upload + download)" : "Credits synced (upload + download)");
      } else if (result.reason === "no_session") {
        toast.message(rw ? "Injira mbere yo gukora sync" : "Sign in before syncing");
      } else {
        toast.error(rw ? `Sync yanze: ${result.reason}` : `Sync failed: ${result.reason}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  const logout = async () => {
    await signOutLocal();
    sessionStorage.removeItem("ikayi-device-mode");
    toast.success(rw ? "Wasohotse" : "Signed out");
    window.location.assign("/");
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="pt-2">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{t("settings")}</p>
        <h2 className="text-2xl font-bold">{rw ? "Igenamiterere" : "Settings"}</h2>
        {account && <p className="mt-1 truncate text-xs text-muted-foreground">{account.identifier}</p>}
      </div>

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cloud className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold">{rw ? "Guhuza amakuru kuri murandasi" : "Cloud Sync"}</h3>
            <p className="text-xs text-muted-foreground">
              {supabaseConfigured
                ? rw
                  ? "Upload + download amadeni kuri telefone zose za konti."
                  : "Upload + download credits on every phone for this account."
                : rw
                  ? "Shyiramo VITE_SUPABASE_URL n'ANON_KEY kuri Vercel."
                  : "Set VITE_SUPABASE_URL and ANON_KEY on Vercel."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={syncing} className="h-10 rounded-full" onClick={() => void syncNow()}>
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
            {rw ? "Huza amakuru" : "Sync"}
          </Button>
          <Button
            variant={auto ? "default" : "outline"}
            className="h-10 rounded-full"
            onClick={() => {
              setAuto((v) => !v);
              toast.success(auto ? (rw ? "Auto-sync yahagaritswe" : "Auto-sync off") : rw ? "Auto-sync yashyizweho" : "Auto-sync on");
            }}
          >
            {auto ? (rw ? "Byikora" : "Auto") : (rw ? "Intoki" : "Manual")}
          </Button>
        </div>
      </section>

      <div className="space-y-2">
        <Button variant="secondary" className="h-12 w-full rounded-full" onClick={() => void logout()}>
          <LogOut className="size-4" />
          {t("logout")}
        </Button>
        <Button variant="destructive" className="h-12 w-full rounded-full" onClick={() => setReset(true)}>
          <Trash2 className="size-4" />
          {t("reset")}
        </Button>
      </div>

      <section className="border-t pt-5">
        <p className="mb-3 text-center text-xs text-muted-foreground">{t("contactDev")}</p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <a href="tel:0796919900"><Phone className="size-4" />{rw ? "Hamagara" : "Call"}</a>
          </Button>
          <Button asChild className="rounded-full bg-success text-success-foreground hover:bg-success/90">
            <a href="https://wa.me/250796919900" target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a>
          </Button>
        </div>
      </section>

      <p className="flex items-center justify-center gap-1.5 pt-3 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        Ikayi · {rw ? "Ikayi y'amadeni" : "Your credit book"}
      </p>

      <Drawer open={reset} onOpenChange={setReset}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader>
            <DrawerTitle>{rw ? "Siba amakuru ya Ikayi?" : "Clear Ikayi data?"}</DrawerTitle>
            <DrawerDescription>
              {rw
                ? "Ibi bisiba amadeni n'ubwishyu kuri iyi telefone. Konti yawe ntishirwa."
                : "Deletes debts and payments on this device. Your account stays signed in."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 p-4 pb-7">
            <Button
              variant="destructive"
              disabled={busy}
              className="h-12 w-full rounded-full"
              onClick={async () => {
                setBusy(true);
                try {
                  await clearDevice();
                  setReset(false);
                  toast.success(t("resetPhoneDone"));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {rw ? "Siba kuri iyi telefone" : "Clear this device"}
            </Button>
            <Button variant="ghost" className="w-full rounded-full" onClick={() => setReset(false)}>
              {t("cancel")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
