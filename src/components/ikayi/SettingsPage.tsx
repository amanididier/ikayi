import { useCallback, useEffect, useState } from "react";
import { Cloud, CloudOff, LogOut, MessageCircle, Phone, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { clearDevice } from "@/lib/credit-db";
import { useI18n } from "@/lib/i18n";
import { isLoggedIn, signOutLocal } from "@/lib/auth";
import { fullSync } from "@/lib/sync";
import { supabaseConfigured } from "@/lib/supabase";

const LAST_SYNC_KEY = "ikayi-last-sync-at";
const AUTO_SYNC_KEY = "ikayi-sync-mode";

function readAutoSync(): boolean {
  try {
    return localStorage.getItem(AUTO_SYNC_KEY) === "auto";
  } catch {
    return false;
  }
}

function readLastSync(): number | null {
  try {
    const v = localStorage.getItem(LAST_SYNC_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeLastSync(ts: number) {
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
  } catch {
    /* */
  }
}

export function SettingsPage() {
  const { t, lang } = useI18n();
  const rw = lang === "rw";
  const [online, setOnline] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [autoSync, setAutoSync] = useState(readAutoSync);

  useEffect(() => {
    setOnline(navigator.onLine);
    const u = () => setOnline(navigator.onLine);
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => {
      window.removeEventListener("online", u);
      window.removeEventListener("offline", u);
    };
  }, []);

  useEffect(() => {
    void isLoggedIn().then(setAuthed);
    setLastSync(readLastSync());
  }, []);

  const doSync = useCallback(async () => {
    if (!supabaseConfigured) {
      toast.error(rw ? "Cloud ntateguye" : "Cloud not configured");
      return;
    }
    if (!navigator.onLine) {
      toast.error(rw ? "Nta murandasi" : "You are offline");
      return;
    }
    setSyncing(true);
    try {
      const res = await fullSync();
      if (!res.ok) {
        toast.error(rw ? `Sync yananiwe: ${res.reason}` : `Sync failed: ${res.reason}`);
        return;
      }
      const now = Date.now();
      writeLastSync(now);
      setLastSync(now);
      toast.success(t("syncDone"));
    } catch (e) {
      console.error(e);
      toast.error(rw ? "Sync yananiwe" : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [rw, t]);

  return (
    <div className="space-y-5 px-1">
      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          {online ? <Cloud className="size-5 text-primary" /> : <CloudOff className="size-5 text-muted-foreground" />}
          <h2 className="font-bold">{t("cloudSync")}</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {online
            ? rw
              ? "Uri online. Sync ishyira amakuru yawe mu cloud."
              : "You are online. Sync uploads and downloads your credit book."
            : rw
              ? "Nta murandasi. Amakuru agumana kuri iyi telefone."
              : "Offline. Data stays on this phone until you sync."}
        </p>
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => {
              const on = e.target.checked;
              setAutoSync(on);
              try {
                localStorage.setItem(AUTO_SYNC_KEY, on ? "auto" : "manual");
              } catch {
                /* Storage can be unavailable in restricted browser contexts. */
              }
            }}
          />
          {t("autoSync")}
        </label>
        <Button className="h-12 w-full rounded-full" disabled={syncing || !online} onClick={() => void doSync()}>
          {syncing ? (rw ? "Birimo…" : "Syncing…") : t("syncNow")}
        </Button>
        {lastSync ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {rw ? "Sync iheruka" : "Last sync"}: {new Date(lastSync).toLocaleString()}
          </p>
        ) : null}
      </section>

      <div className="space-y-2">
        {authed && (
          <Button
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={async () => {
              await signOutLocal();
              sessionStorage.removeItem("ikayi-device-mode");
              window.location.reload();
            }}
          >
            <LogOut className="size-4" />
            {t("logout")}
          </Button>
        )}
        <Button type="button" variant="destructive" className="h-12 w-full rounded-full font-semibold" onClick={() => setReset(true)}>
          <Trash2 className="size-4" />
          {t("reset")}
        </Button>
      </div>

      <section className="border-t pt-5">
        <p className="mb-3 text-center text-xs text-muted-foreground">{t("contactDev")}</p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <a href="tel:0796919900">
              <Phone className="size-4" />
              {rw ? "Hamagara" : "Call"}
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-success/40 text-success hover:bg-success/10">
            <a href="https://wa.me/250796919900" target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
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
              className="h-12 w-full rounded-full font-semibold"
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
