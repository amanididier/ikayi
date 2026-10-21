/**
 * Ikayi Yange auth — phone uses synthetic email for one password path.
 * Works online (Supabase) and offline (local account flag).
 */
import { ensureSupabase, supabaseConfigured } from "@/lib/supabase";

export const MIN_PASSWORD = 6;
const ACCOUNT_KEY = "ikayi-account";
const LOGGED_KEY = "ikayi-logged-in";

export type LoginType = "phone" | "email";
export type Account = {
  loginType: LoginType;
  identifier: string;
  fullName?: string;
  supabaseUserId?: string;
  createdAt: number;
};

export function syntheticEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "250");
  return `phone_${digits}@ikayi.app`;
}

function normalizeId(loginType: LoginType, identifier: string): string {
  const v = identifier.trim();
  if (loginType === "email") return v.toLowerCase();
  return v.replace(/\D/g, "");
}

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

function saveAccount(a: Account) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a));
}

export async function isLoggedIn(): Promise<boolean> {
  if (localStorage.getItem(LOGGED_KEY) === "1") return true;
  const client = await ensureSupabase();
  if (!client) return false;
  const { data } = await client.auth.getSession();
  if (data.session?.user) {
    localStorage.setItem(LOGGED_KEY, "1");
    return true;
  }
  return false;
}

export function setLoggedIn(v: boolean) {
  if (v) localStorage.setItem(LOGGED_KEY, "1");
  else localStorage.removeItem(LOGGED_KEY);
}

export async function signUp(opts: {
  loginType: LoginType;
  identifier: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string; detail?: string }> {
  const id = normalizeId(opts.loginType, opts.identifier);
  if (!id) return { ok: false, error: "bad_id" };
  if (opts.password.length < MIN_PASSWORD) return { ok: false, error: "bad_password" };

  const client = await ensureSupabase();
  const email = opts.loginType === "email" ? id : syntheticEmail(id);

  // Offline or no cloud: local-only account
  if (!supabaseConfigured || !client || !navigator.onLine) {
    saveAccount({ loginType: opts.loginType, identifier: id, createdAt: Date.now() });
    setLoggedIn(true);
    return { ok: true };
  }

  const { data, error } = await client.auth.signUp({ email, password: opts.password });
  if (error) {
    if (/already registered|already been registered|user already/i.test(error.message)) {
      return { ok: false, error: "exists", detail: error.message };
    }
    return { ok: false, error: "signup_failed", detail: error.message };
  }
  if (data.user) {
    saveAccount({
      loginType: opts.loginType,
      identifier: id,
      supabaseUserId: data.user.id,
      createdAt: Date.now(),
    });
    setLoggedIn(true);
    return { ok: true };
  }
  return { ok: false, error: "signup_failed" };
}

export async function signIn(opts: {
  loginType: LoginType;
  identifier: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string; detail?: string }> {
  const id = normalizeId(opts.loginType, opts.identifier);
  if (!id || opts.password.length < 1) return { ok: false, error: "bad_password" };

  const client = await ensureSupabase();
  const email = opts.loginType === "email" ? id : syntheticEmail(id);

  if (supabaseConfigured && client && navigator.onLine) {
    const { data, error } = await client.auth.signInWithPassword({ email, password: opts.password });
    if (error) {
      // Same Supabase message for wrong password AND unknown user — never force signup UI
      if (/invalid login credentials|invalid credentials|wrong password|user not found/i.test(error.message)) {
        return { ok: false, error: "wrong_credentials", detail: error.message };
      }
      if (/email not confirmed/i.test(error.message)) {
        return { ok: false, error: "confirmation_required", detail: error.message };
      }
      return { ok: false, error: "wrong_credentials", detail: error.message };
    }
    if (data.session?.user) {
      saveAccount({
        loginType: opts.loginType,
        identifier: id,
        supabaseUserId: data.session.user.id,
        createdAt: Date.now(),
      });
      setLoggedIn(true);
      return { ok: true };
    }
  }

  // Offline: match local account only
  const account = getAccount();
  if (!account) return { ok: false, error: "no_account" };
  if (account.loginType !== opts.loginType || account.identifier !== id) {
    return { ok: false, error: "mismatch" };
  }
  setLoggedIn(true);
  return { ok: true };
}

export async function signOutLocal() {
  setLoggedIn(false);
  const client = await ensureSupabase();
  if (client) await client.auth.signOut().catch(() => {});
}

export async function requestPasswordReset(emailOrPhone: string, loginType: LoginType) {
  const client = await ensureSupabase();
  if (!client || !supabaseConfigured) return { ok: false as const, error: "no_cloud" };
  const email = loginType === "email" ? emailOrPhone.trim().toLowerCase() : syntheticEmail(emailOrPhone);
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
