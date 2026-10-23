/**
 * Ikayi usage analytics — daily activity log only (pages opened, app opens).
 * No debt, payment or contact data is ever tracked here.
 * Stored on-device, then uploaded at most once per day when the device is
 * online. Separate from credit sync on purpose.
 */
import { db, type UsageRow } from "@/lib/credit-db";
import { ensureSupabase, supabaseConfigured } from "@/lib/supabase";

const SENT_KEY = "ikayi-usage-sent";
const DEVICE_KEY = "ikayi-device-id";
export const OPEN_PATH = "__open__";

export function dayKey(now = Date.now()): string {
  const d = new Date(now);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function normalizePath(path: string): string {
  if (path === "/") return "/";
  if (path.startsWith("/i-owe")) return "/i-owe";
  if (path.startsWith("/settings")) return "/settings";
  if (path.startsWith("/welcome")) return "/welcome";
  if (path.startsWith("/install-android")) return "/install-android";
  if (path.startsWith("/admin")) return "/admin";
  return "/other";
}

export function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** True when no upload has completed yet for this local day. */
export function shouldSendToday(lastSent: string | null | undefined, now = Date.now()): boolean {
  return lastSent !== dayKey(now);
}

/** Rows with activity not yet uploaded, with the unreported delta. */
export function pendingDeltas(rows: UsageRow[]): (UsageRow & { delta: number })[] {
  return rows.filter((r) => r.views > r.reported).map((r) => ({ ...r, delta: r.views - r.reported }));
}

async function bump(path: string, now: number): Promise<void> {
  const date = dayKey(now);
  await db.transaction("rw", db.usage, async () => {
    const row = await db.usage.get([date, path]);
    await db.usage.put({ date, path, views: (row?.views ?? 0) + 1, reported: row?.reported ?? 0 });
  });
}

export async function trackPageView(path: string, now = Date.now()): Promise<void> {
  await bump(normalizePath(path), now);
}

export async function trackAppOpen(now = Date.now()): Promise<void> {
  await bump(OPEN_PATH, now);
}

/** Minimal upsert client so tests can inject a fake. */
export type UsageUploader = {
  from(table: string): { upsert(rows: unknown[], opts: { onConflict: string }): PromiseLike<{ error: { message: string } | null }> };
};

/**
 * Uploads absolute per-day counts (idempotent upsert), then marks rows
 * reported. Completed past days are dropped from the device; today's row
 * stays so the rest of the day is uploaded tomorrow.
 */
export async function uploadUsage(
  client: UsageUploader,
  userId: string,
  now = Date.now(),
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const rows = await db.usage.toArray();
  const deltas = pendingDeltas(rows);
  if (deltas.length) {
    const { error } = await client.from("usage_daily").upsert(
      deltas.map((r) => ({
        user_id: userId,
        device_id: deviceId(),
        day: r.date,
        path: r.path,
        views: r.views,
      })),
      { onConflict: "user_id,device_id,day,path" },
    );
    if (error) return { ok: false, reason: error.message };
  }
  const today = dayKey(now);
  await db.transaction("rw", db.usage, async () => {
    for (const r of rows) {
      const current = await db.usage.get([r.date, r.path]);
      if (!current) continue;
      if (r.date < today && current.views === r.views) await db.usage.delete([r.date, r.path]);
      else await db.usage.put({ ...current, reported: r.views });
    }
  });
  return { ok: true };
}

export type SendResult =
  | { ok: true; sent: boolean }
  | { ok: false; reason: string };

/**
 * Runs on app start and whenever the device comes online. Uploads pending
 * activity at most once per local day; failed or offline attempts are not
 * counted, so the next online moment that day tries again.
 */
let sending: Promise<SendResult> | undefined;

export function maybeSendUsage(now = Date.now()): Promise<SendResult> {
  if (sending) return sending;
  sending = sendUsage(now).catch((error: unknown): SendResult => ({
    ok: false, reason: error instanceof Error ? error.message : "upload_failed",
  })).finally(() => { sending = undefined; });
  return sending;
}

async function sendUsage(now: number): Promise<SendResult> {
  if (!shouldSendToday(localStorage.getItem(SENT_KEY), now)) return { ok: true, sent: false };
  if (!supabaseConfigured) return { ok: false, reason: "no_cloud" };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { ok: false, reason: "offline" };
  const client = await ensureSupabase();
  if (!client) return { ok: false, reason: "no_client" };
  const { data } = await client.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return { ok: false, reason: "no_session" };
  const res = await uploadUsage(client, uid, now);
  if (!res.ok) return res;
  localStorage.setItem(SENT_KEY, dayKey(now));
  return { ok: true, sent: true };
}
