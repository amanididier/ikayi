import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/credit-db';

const fake = vi.hoisted(() => ({ uid: 'user-1' as string | null, rows: new Map<string, Record<string, unknown>[]>(), denied: false, duringPull: undefined as (() => Promise<void>) | undefined }));
vi.mock('@/lib/supabase', () => ({
  supabaseConfigured: true,
  ensureSupabase: async () => ({
    auth: { getSession: async () => ({ data: { session: fake.uid ? { user: { id: fake.uid } } : null } }) },
    from: (table: string) => ({
      upsert: async (rows: Record<string, unknown>[], options: { onConflict: string }) => {
        expect(options.onConflict).toBe('user_id,local_id');
        if (fake.denied) return { error: { message: 'denied' } };
        fake.rows.set(table, rows);
        return { error: null };
      },
      select: () => ({ eq: async (_column: string, uid: string) => {
        if (table === 'parties') await fake.duringPull?.();
        return { data: (fake.rows.get(table) ?? []).filter((row) => row['user_id'] === uid), error: null };
      } }),
    }),
  }),
}));
import { fullSync } from '@/lib/sync';

beforeEach(async () => {
  fake.uid = 'user-1'; fake.denied = false; fake.rows.clear(); fake.duringPull = undefined;
  await Promise.all([db.parties.clear(), db.debts.clear(), db.payments.clear()]);
  await db.parties.put({ id: 1, name: 'Test person', phone: '', kind: 'customer', createdAt: 1000 });
  await db.debts.put({ id: 2, partyId: 1, amount: 15000, description: 'Test credit', createdAt: 1000 });
  await db.payments.put({ id: 3, partyId: 1, amount: 5000, createdAt: 2000 });
});

describe('manual credit sync', () => {
  it('uploads people, credits and payments under the signed-in account then reads them back', async () => {
    expect(await fullSync()).toEqual({ ok: true });
    expect(fake.rows.get('parties')?.[0]).toMatchObject({ user_id: 'user-1', local_id: 1, name: 'Test person' });
    expect(fake.rows.get('debts')?.[0]).toMatchObject({ user_id: 'user-1', party_local_id: 1, amount: 15000 });
    expect(fake.rows.get('payments')?.[0]).toMatchObject({ user_id: 'user-1', amount: 5000 });
    expect((await db.debts.get(2))?.amount).toBe(15000);
  });
  it('does not report success or upload without a real session', async () => {
    fake.uid = null;
    expect(await fullSync()).toEqual({ ok: false, reason: 'no_session' });
    expect(fake.rows.size).toBe(0);
  });
  it('retains local data if the service rejects the upload', async () => {
    fake.denied = true;
    expect(await fullSync()).toEqual({ ok: false, reason: 'parties: denied' });
    expect(await db.debts.count()).toBe(1);
  });
  it('preserves credits recorded while sync is in flight', async () => {
    fake.duringPull = async () => { await db.debts.put({ id: 4, partyId: 1, amount: 2000, createdAt: 3000 }); };
    expect(await fullSync()).toEqual({ ok: true });
    expect((await db.debts.get(4))?.amount).toBe(2000);
  });
});