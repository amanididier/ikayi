import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Eye, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { ensureSupabase, supabaseConfigured } from "@/lib/supabase";
import { OPEN_PATH } from "@/lib/usage";
import logo from "@/assets/ikayi-logo.png";

type UsageRow = { user_id: string; device_id: string; day: string; path: string; views: number };
type Profile = { id: string; full_name: string | null; phone: string | null };
type State =
  | { status: "loading" }
  | { status: "no_cloud" }
  | { status: "signed_out" }
  | { status: "not_admin" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: UsageRow[]; profiles: Map<string, Profile> };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Ikayi — Admin" },
      { name: "description", content: "Ikayi usage analytics for the app owner." },
      { property: "og:title", content: "Ikayi — Admin" },
      { property: "og:description", content: "Private Ikayi activity summary for the app owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const PATH_LABELS: Record<string, string> = {
  [OPEN_PATH]: "App opens",
  "/": "Owes me",
  "/i-owe": "I owe",
  "/settings": "Settings",
  "/welcome": "Welcome",
  "/install-android": "Install page",
  "/admin": "Admin",
  "/other": "Other",
};

function AdminPage() {
  const { lang } = useI18n();
  const rw = lang === "rw";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!supabaseConfigured) return setState({ status: "no_cloud" });
      const client = await ensureSupabase();
      if (!client) return setState({ status: "no_cloud" });
      const { data: sess } = await client.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return setState({ status: "signed_out" });
      const { data: adminRows, error: adminErr } = await client.from("app_admins").select("user_id");
      if (cancelled) return;
      if (adminErr) return setState({ status: "error", message: adminErr.message });
      if (!adminRows?.length) return setState({ status: "not_admin" });
      const [usageRes, profileRes] = await Promise.all([
        client.from("usage_daily").select("user_id,device_id,day,path,views"),
        client.from("profiles").select("id,full_name,phone"),
      ]);
      if (cancelled) return;
      if (usageRes.error) return setState({ status: "error", message: usageRes.error.message });
      const profiles = new Map<string, Profile>(
        (profileRes.data ?? []).map((p: Profile) => [p.id, p]),
      );
      setState({ status: "ready", rows: (usageRes.data ?? []) as UsageRow[], profiles });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (state.status !== "ready") return null;
    const users = new Map<string, { opens: number; views: number; lastDay: string; devices: Set<string> }>();
    const pages = new Map<string, number>();
    const days = new Map<string, number>();
    for (const r of state.rows) {
      const u = users.get(r.user_id) ?? { opens: 0, views: 0, lastDay: "", devices: new Set<string>() };
      u.views += r.views;
      if (r.path === OPEN_PATH) u.opens += r.views;
      if (r.day > u.lastDay) u.lastDay = r.day;
      u.devices.add(r.device_id);
      users.set(r.user_id, u);
      if (r.path !== OPEN_PATH) pages.set(r.path, (pages.get(r.path) ?? 0) + r.views);
      else days.set(r.day, (days.get(r.day) ?? 0) + r.views);
    }
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    return {
      totalUsers: users.size,
      activeWeek: [...users.values()].filter((u) => u.lastDay >= weekAgo).length,
      totalViews: [...users.values()].reduce((s, u) => s + u.views, 0),
      users,
      pages: [...pages.entries()].sort((a, b) => b[1] - a[1]),
      days: [...days.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14),
    };
  }, [state]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="size-11 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold">Ikayi Admin</h1>
            <p className="text-[11px] text-muted-foreground">
              {rw ? "Ikoreshwa ry'app (nta madeni ahagaragara)" : "App usage (no credit data)"}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="h-9 rounded-full">
          <Link to="/"><ArrowLeft className="size-4" />{rw ? "Subira" : "Back"}</Link>
        </Button>
      </header>

      <main className="space-y-5 px-4 pb-12 pt-3">
        {state.status === "loading" && <p className="pt-10 text-center text-sm text-muted-foreground">{rw ? "Tegereza…" : "Loading…"}</p>}
        {state.status === "no_cloud" && <Notice>{rw ? "Cloud ntabwo ihujwe." : "Cloud is not configured for this build."}</Notice>}
        {state.status === "signed_out" && <Notice>{rw ? "Injira mbere, hanyuma ufungure /admin." : "Sign in on the app first, then open /admin again."}</Notice>}
        {state.status === "not_admin" && (
          <Notice>
            {rw
              ? "Konti yawe ntabwo ari admin. Ongeraho user ID yawe muri app_admins muri Supabase."
              : "This account is not an admin. Add your user id to the app_admins table in Supabase (see supabase/schema.sql)."}
          </Notice>
        )}
        {state.status === "error" && <Notice>{state.message}</Notice>}

        {state.status === "ready" && stats && (
          <>
            <section className="grid grid-cols-3 gap-2">
              <Stat icon={<Users className="size-4" />} label={rw ? "Abakoresha" : "Users"} value={stats.totalUsers} />
              <Stat icon={<Eye className="size-4" />} label={rw ? "Bakoresheje icyumweru" : "Active this week"} value={stats.activeWeek} />
              <Stat icon={<BarChart3 className="size-4" />} label={rw ? "Paji zafunguwe" : "Page views"} value={stats.totalViews} />
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-card">
              <h2 className="mb-3 text-base font-bold">{rw ? "Paji zikunzwe" : "Most used pages"}</h2>
              <ul className="space-y-2">
                {stats.pages.length === 0 && <li className="text-sm text-muted-foreground">{rw ? "Nta makuru aracyariho." : "No data yet."}</li>}
                {stats.pages.map(([path, views]) => (
                  <li key={path} className="flex items-center justify-between gap-3 text-sm">
                    <span>{PATH_LABELS[path] ?? path}</span>
                    <span className="font-semibold tabular-nums">{views}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-card">
              <h2 className="mb-3 text-base font-bold">{rw ? "Abakoresha" : "Users"}</h2>
              <ul className="space-y-3">
                {stats.users.size === 0 && <li className="text-sm text-muted-foreground">{rw ? "Nta makuru aracyariho." : "No data yet."}</li>}
                {[...stats.users.entries()]
                  .sort((a, b) => b[1].lastDay.localeCompare(a[1].lastDay))
                  .map(([uid, u]) => {
                    const p = state.profiles.get(uid);
                    const name = p?.full_name?.trim() || p?.phone?.trim() || `${uid.slice(0, 8)}…`;
                    return (
                      <li key={uid} className="border-b pb-3 text-sm last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{name}</span>
                          <span className="text-xs text-muted-foreground">{rw ? "yaherukaga" : "last active"} {u.lastDay || "—"}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {u.opens} {rw ? "ufungure" : "opens"} · {u.views} {rw ? "paji" : "views"} · {u.devices.size} {rw ? "telefone" : "device(s)"}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-card">
              <h2 className="mb-3 text-base font-bold">{rw ? "Ufungurwa buri munsi" : "Opens per day"}</h2>
              <ul className="space-y-2">
                {stats.days.length === 0 && <li className="text-sm text-muted-foreground">{rw ? "Nta makuru aracyariho." : "No data yet."}</li>}
                {stats.days.map(([day, opens]) => (
                  <li key={day} className="flex items-center justify-between gap-3 text-sm">
                    <span className="tabular-nums">{day}</span>
                    <span className="font-semibold tabular-nums">{opens}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center shadow-card">
      <p className="mx-auto mb-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">{icon}{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border bg-card p-4 text-center text-sm shadow-card">{children}</p>;
}
