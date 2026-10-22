import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/credit-db";
import {
  OPEN_PATH,
  dayKey,
  normalizePath,
  pendingDeltas,
  shouldSendToday,
  trackAppOpen,
  trackPageView,
  uploadUsage,
  type UsageUploader,
} from "@/lib/usage";

const DAY = 86400000;
// Use midday so local-day boundaries never straddle the test run date.
const NOON = new Date();
NOON.setHours(12, 0, 0, 0);
const T0 = NOON.getTime();

function fakeClient() {
  const calls: { rows: unknown[]; onConflict: string }[] = [];
  const client: UsageUploader = {
    from: () => ({
      upsert: async (rows, opts) => {
        calls.push({ rows, onConflict: opts.onConflict });
        return { error: null };
      },
    }),
  };
  return { client, calls };
}

beforeEach(async () => {
  localStorage.clear();
  await db.usage.clear();
});

describe("usage tracking", () => {
  it("counts each page view per day and path", async () => {
    await trackPageView("/", T0);
    await trackPageView("/", T0 + 1000);
    await trackPageView("/i-owe", T0 + 2000);
    const rows = await db.usage.toArray();
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.path === "/")?.views).toBe(2);
    expect(rows.find((r) => r.path === "/i-owe")?.views).toBe(1);
  });

  it("records app opens under the opens path", async () => {
    await trackAppOpen(T0);
    const row = await db.usage.get([dayKey(T0), OPEN_PATH]);
    expect(row?.views).toBe(1);
  });

  it("groups unknown paths as /other", () => {
    expect(normalizePath("/i-owe/123")).toBe("/i-owe");
    expect(normalizePath("/something/else")).toBe("/other");
  });
});

describe("daily upload", () => {
  it("sends at most once per local day", () => {
    expect(shouldSendToday(null, T0)).toBe(true);
    expect(shouldSendToday(dayKey(T0 - DAY), T0)).toBe(true);
    expect(shouldSendToday(dayKey(T0), T0 + 3600000)).toBe(false);
  });

  it("uploads only unreported activity with absolute counts", async () => {
    await trackPageView("/", T0);
    await trackPageView("/", T0 + 1);
    await trackAppOpen(T0 + 2);
    const { client, calls } = fakeClient();
    const res = await uploadUsage(client, "user-1", T0);
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].rows).toHaveLength(2);
    const home = calls[0].rows.find((r) => (r as { path: string }).path === "/") as { views: number; user_id: string };
    expect(home.views).toBe(2);
    expect(home.user_id).toBe("user-1");
    // Nothing left to report for today, so a second upload sends no rows.
    expect(pendingDeltas(await db.usage.toArray())).toHaveLength(0);
  });

  it("keeps today's row for tomorrow and deletes fully reported past days", async () => {
    await trackPageView("/", T0 - DAY); // yesterday
    await trackPageView("/", T0); // today
    const { client } = fakeClient();
    await uploadUsage(client, "user-1", T0);
    const rows = await db.usage.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].date).toBe(dayKey(T0));
    expect(rows[0].reported).toBe(1);
  });

  it("reports an error when the cloud rejects the upload", async () => {
    await trackPageView("/", T0);
    const failing: UsageUploader = {
      from: () => ({ upsert: async () => ({ error: { message: "denied" } }) }),
    };
    const res = await uploadUsage(failing, "user-1", T0);
    expect(res).toEqual({ ok: false, reason: "denied" });
    // Data stays pending so the next online moment retries.
    expect(pendingDeltas(await db.usage.toArray())).toHaveLength(1);
  });
});
