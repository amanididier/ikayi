/**
 * Ikayi credit sync — parties, debts, payments only.
 * Same table shapes as Stoke Yange (user_id + local_id).
 */
import { db } from "@/lib/credit-db";
import { ensureSupabase, supabaseConfigured } from "@/lib/supabase";

export type SyncResult = { ok: true } | { ok: false; reason: string };

async function sessionUserId(): Promise<string | null> {
  const client = await ensureSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function fullSync(): Promise<SyncResult> {
  if (!supabaseConfigured) return { ok: false, reason: "no_cloud" };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { ok: false, reason: "offline" };

  const client = await ensureSupabase();
  if (!client) return { ok: false, reason: "no_client" };

  const userId = await sessionUserId();
  if (!userId) return { ok: false, reason: "no_session" };

  const push = await pushCredit(userId);
  if (!push.ok) return push;
  return pullCredit(userId, { force: true });
}

export async function pushCredit(userId?: string): Promise<SyncResult> {
  const client = await ensureSupabase();
  if (!client || !supabaseConfigured) return { ok: false, reason: "no_cloud" };
  const uid = userId ?? (await sessionUserId());
  if (!uid) return { ok: false, reason: "no_session" };

  const [parties, debts, payments] = await Promise.all([
    db.parties.toArray(),
    db.debts.toArray(),
    db.payments.toArray(),
  ]);

  if (parties.length) {
    const { error } = await client.from("parties").upsert(
      parties.map((p) => ({
        user_id: uid,
        local_id: p.id,
        name: p.name,
        phone: p.phone ?? "",
        kind: p.kind,
        created_at: new Date(p.createdAt).toISOString(),
      })),
      { onConflict: "user_id,local_id" },
    );
    if (error) return { ok: false, reason: `parties: ${error.message}` };
  }

  if (debts.length) {
    const { error } = await client.from("debts").upsert(
      debts.map((d) => ({
        user_id: uid,
        local_id: d.id,
        party_local_id: d.partyId,
        description: d.description ?? "",
        amount: d.amount,
        created_at: new Date(d.createdAt).toISOString(),
        due_days: d.dueDays ?? null,
      })),
      { onConflict: "user_id,local_id" },
    );
    if (error) return { ok: false, reason: `debts: ${error.message}` };
  }

  if (payments.length) {
    const { error } = await client.from("payments").upsert(
      payments.map((p) => ({
        user_id: uid,
        local_id: p.id,
        party_local_id: p.partyId,
        amount: p.amount,
        created_at: new Date(p.createdAt).toISOString(),
      })),
      { onConflict: "user_id,local_id" },
    );
    if (error) return { ok: false, reason: `payments: ${error.message}` };
  }

  return { ok: true };
}

export async function pullCredit(
  userId?: string,
  opts?: { force?: boolean },
): Promise<SyncResult> {
  const client = await ensureSupabase();
  if (!client || !supabaseConfigured) return { ok: false, reason: "no_cloud" };
  const uid = userId ?? (await sessionUserId());
  if (!uid) return { ok: false, reason: "no_session" };

  const [partiesRes, debtsRes, paymentsRes] = await Promise.all([
    client.from("parties").select("*").eq("user_id", uid),
    client.from("debts").select("*").eq("user_id", uid),
    client.from("payments").select("*").eq("user_id", uid),
  ]);

  if (partiesRes.error) return { ok: false, reason: `pull parties: ${partiesRes.error.message}` };
  if (debtsRes.error) return { ok: false, reason: `pull debts: ${debtsRes.error.message}` };
  if (paymentsRes.error) return { ok: false, reason: `pull payments: ${paymentsRes.error.message}` };

  const remoteParties = partiesRes.data ?? [];
  const remoteDebts = debtsRes.data ?? [];
  const remotePays = paymentsRes.data ?? [];

  const localCount =
    (await db.parties.count()) + (await db.debts.count()) + (await db.payments.count());
  const shouldReplace = opts?.force || localCount === 0;

  if (shouldReplace) {
    await db.transaction("rw", db.parties, db.debts, db.payments, async () => {
      await db.parties.clear();
      await db.debts.clear();
      await db.payments.clear();
      if (remoteParties.length) {
        await db.parties.bulkPut(
          remoteParties.map((p: Record<string, unknown>) => ({
            id: Number(p["local_id"]),
            name: String(p["name"] ?? ""),
            phone: String(p["phone"] ?? ""),
            kind: (p["kind"] === "supplier" ? "supplier" : "customer") as "customer" | "supplier",
            createdAt: p["created_at"] ? new Date(String(p["created_at"])).getTime() : Date.now(),
          })),
        );
      }
      if (remoteDebts.length) {
        await db.debts.bulkPut(
          remoteDebts.map((d: Record<string, unknown>) => ({
            id: Number(d["local_id"]),
            partyId: Number(d["party_local_id"]),
            amount: Number(d["amount"]),
            description: String(d["description"] ?? ""),
            createdAt: d["created_at"] ? new Date(String(d["created_at"])).getTime() : Date.now(),
            ...(d["due_days"] != null ? { dueDays: Number(d["due_days"]) } : {}),
          })),
        );
      }
      if (remotePays.length) {
        await db.payments.bulkPut(
          remotePays.map((p: Record<string, unknown>) => ({
            id: Number(p["local_id"]),
            partyId: Number(p["party_local_id"]),
            amount: Number(p["amount"]),
            createdAt: p["created_at"] ? new Date(String(p["created_at"])).getTime() : Date.now(),
          })),
        );
      }
    });
  } else {
    for (const p of remoteParties) {
      const id = Number((p as { local_id: number }).local_id);
      if (!(await db.parties.get(id))) {
        await db.parties.put({
          id,
          name: String((p as { name?: string }).name ?? ""),
          phone: String((p as { phone?: string }).phone ?? ""),
          kind: ((p as { kind?: string }).kind === "supplier" ? "supplier" : "customer") as "customer" | "supplier",
          createdAt: (p as { created_at?: string }).created_at
            ? new Date(String((p as { created_at: string }).created_at)).getTime()
            : Date.now(),
        });
      }
    }
    for (const d of remoteDebts) {
      const id = Number((d as { local_id: number }).local_id);
      if (!(await db.debts.get(id))) {
        await db.debts.put({
          id,
          partyId: Number((d as { party_local_id: number }).party_local_id),
          amount: Number((d as { amount: number }).amount),
          description: String((d as { description?: string }).description ?? ""),
          createdAt: (d as { created_at?: string }).created_at
            ? new Date(String((d as { created_at: string }).created_at)).getTime()
            : Date.now(),
          ...((d as { due_days?: number }).due_days != null
            ? { dueDays: Number((d as { due_days: number }).due_days) }
            : {}),
        });
      }
    }
    for (const p of remotePays) {
      const id = Number((p as { local_id: number }).local_id);
      if (!(await db.payments.get(id))) {
        await db.payments.put({
          id,
          partyId: Number((p as { party_local_id: number }).party_local_id),
          amount: Number((p as { amount: number }).amount),
          createdAt: (p as { created_at?: string }).created_at
            ? new Date(String((p as { created_at: string }).created_at)).getTime()
            : Date.now(),
        });
      }
    }
  }

  return { ok: true };
}

export async function checkRemoteAhead(): Promise<{ ahead: boolean }> {
  if (!supabaseConfigured || !navigator.onLine) return { ahead: false };
  const client = await ensureSupabase();
  if (!client) return { ahead: false };
  const uid = await sessionUserId();
  if (!uid) return { ahead: false };

  const localMax = Math.max(
    0,
    ...(await db.debts.toArray()).map((d) => d.createdAt),
    ...(await db.payments.toArray()).map((p) => p.createdAt),
    ...(await db.parties.toArray()).map((p) => p.createdAt),
  );

  const { data } = await client
    .from("debts")
    .select("created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data?.length) return { ahead: false };
  const remoteTs = new Date(data[0]?.created_at ?? 0).getTime();
  return { ahead: remoteTs > localMax + 2000 };
}
