import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/credit-db';

const state = vi.hoisted(() => ({ calls: 0, fail: false }));
vi.mock('@/lib/supabase', () => ({
  supabaseConfigured: true,
  ensureSupabase: async () => ({
    auth: { getSession: async () => ({ data: { session: { user: { id: 'test-user' } } } }) },
    from: () => ({ upsert: async () => { state.calls++; return { error: state.fail ? { message: 'temporary failure' } : null }; } }),
  }),
}));
import { dayKey, maybeSendUsage, trackPageView } from '@/lib/usage';
const morning = new Date(2026, 9, 23, 9).getTime();
beforeEach(async () => { localStorage.clear(); await db.usage.clear(); state.calls = 0; state.fail = false; });

describe('background daily sending', () => {
  it('uploads once at 9am, keeps later activity local, then sends it the following day', async () => {
    await trackPageView('/', morning);
    expect(await maybeSendUsage(morning)).toEqual({ ok: true, sent: true });
    await trackPageView('/', morning + 3600000);
    expect(await maybeSendUsage(morning + 3600000)).toEqual({ ok: true, sent: false });
    expect(state.calls).toBe(1);
    expect((await db.usage.get([dayKey(morning), '/']))?.views).toBe(2);
    expect(await maybeSendUsage(morning + 86400000)).toEqual({ ok: true, sent: true });
    expect(state.calls).toBe(2);
  });
  it('coalesces simultaneous online triggers into one upload', async () => {
    await trackPageView('/', morning);
    await Promise.all([maybeSendUsage(morning), maybeSendUsage(morning)]);
    expect(state.calls).toBe(1);
  });
  it('retries a failed send rather than treating it as a completed daily upload', async () => {
    await trackPageView('/', morning);
    state.fail = true;
    expect(await maybeSendUsage(morning)).toEqual({ ok: false, reason: 'temporary failure' });
    state.fail = false;
    expect(await maybeSendUsage(morning + 1000)).toEqual({ ok: true, sent: true });
    expect(state.calls).toBe(2);
  });
});