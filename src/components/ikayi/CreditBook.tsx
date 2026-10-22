import { useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ChevronDown,
  Plus,
  Search,
  Trash2,
  MessageCircle,
  MessageSquare,
  X,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  db,
  summarize,
  fmt,
  addPerson,
  addDebt,
  pay,
  deletePerson,
  type Party,
  type PartyKind,
} from "@/lib/credit-db";
import { useI18n, reminderText } from "@/lib/i18n";
import { DeadlinePicker, isoToDueDays } from "@/components/ikayi/DeadlinePicker";
import { pushCredit } from "@/lib/sync";
import { maybeSendUsage, trackAction } from "@/lib/usage";

type FormKind = "person" | "debt" | "payment" | "edit";

export function CreditBook({ kind }: { kind: PartyKind }) {
  const { t, lang } = useI18n();
  const rw = lang === "rw";
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [history, setHistory] = useState(false);
  const [form, setForm] = useState<{ type: FormKind; party?: Party; balance?: number } | null>(null);
  const [removing, setRemoving] = useState<Party | null>(null);
  const [busy, setBusy] = useState(false);

  const parties = useLiveQuery(() => db.parties.where("kind").equals(kind).toArray(), [kind]);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const payments = useLiveQuery(() => db.payments.toArray(), []);

  const data = useMemo(() => {
    if (!parties || !debts || !payments) return undefined;
    return summarize(parties, debts, payments);
  }, [parties, debts, payments]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) => r.p.name.toLowerCase().includes(q) || r.p.phone.includes(q),
    );
  }, [data, query]);

  const reminder = (party: Party, balance: number, via: "wa" | "sms") => {
    const phone = party.phone.replace(/\D/g, "").replace(/^0/, "250");
    const text = encodeURIComponent(reminderText(lang, party.name, fmt(balance), "Ikayi Yange"));
    window.open(
      via === "wa" ? `https://wa.me/${phone}?text=${text}` : `sms:+${phone}?body=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{t(kind === "customer" ? "owesMe" : "iOwe")}</h2>
        <Button className="h-10 rounded-full" onClick={() => setForm({ type: "person" })}>
          <Plus className="size-4" />
          {t("addParty")}
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-4 size-4 text-muted-foreground" />
        <Input
          aria-label={rw ? "Shakisha umuntu" : "Search people"}
          placeholder={rw ? "Shakisha izina cyangwa telefone…" : "Search name or phone…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-xl bg-card pl-10 pr-10"
        />
        {query && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 rounded-full" aria-label={rw ? "Siba" : "Clear search"} onClick={() => setQuery("")}>
            <X />
          </Button>
        )}
      </div>

      {data === undefined ? (
        <p className="py-12 text-center text-sm text-muted-foreground" role="status">{rw ? "Tegereza…" : "Loading…"}</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{t("noItems")}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const open = openId === r.p.id;
            const txs = [
              ...r.debts.map((d) => ({
                key: `d-${d.id}`,
                kind: "debt" as const,
                label: d.description || t("addDebtLbl"),
                amount: d.amount,
                at: d.createdAt,
                extra: d.dueDays ? ` · ${d.dueDays} ${t("days")}` : "",
              })),
              ...r.payments.map((p) => ({
                key: `p-${p.id}`,
                kind: "payment" as const,
                label: rw ? "Ubwishyu" : "Payment",
                amount: p.amount,
                at: p.createdAt,
                extra: "",
              })),
            ].sort((a, b) => a.at - b.at);
            const shown = history && openId === r.p.id ? txs : txs.slice(-4);
            return (
              <li key={r.p.id} className="rounded-2xl bg-card p-3 shadow-card">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="size-11 shrink-0 rounded-full bg-accent p-0 text-base font-bold text-accent-foreground" aria-label={`${t("edit")} ${r.p.name}`} onClick={() => setForm({ type: "edit", party: r.p })}>
                    {r.p.name[0]?.toUpperCase()}
                  </Button>
                  <Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start p-0 text-left hover:bg-transparent" aria-label={r.p.name} aria-expanded={open} onClick={() => { setOpenId(open ? null : r.p.id); setHistory(false); }}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.p.name}</span>
                      <span className="block whitespace-normal text-[11px] font-normal text-muted-foreground">
                        {r.p.phone || "—"} · {Math.floor((Date.now() - r.oldest) / 86400000)} {t("days")}
                        {r.overdue && <span className="ml-1 text-destructive"> · {t("overdue")}</span>}
                      </span>
                    </span>
                  </Button>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-primary">{fmt(r.balance)}</span>
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground ${open ? "rotate-180" : ""}`} />
                </div>
                {open && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    <ul className="space-y-2">
                      {shown.map((tx) => (
                        <li key={tx.key} className="flex justify-between gap-3 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{tx.label}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(tx.at).toLocaleDateString("en-GB")}
                              {tx.extra}
                            </span>
                          </span>
                          <span className={`shrink-0 font-semibold tabular-nums ${tx.kind === "payment" ? "text-emerald-600" : "text-primary"}`}>
                            {tx.kind === "payment" ? "−" : "+"}
                            {fmt(tx.amount)}
                          </span>
                        </li>
                      ))}
                      {shown.length === 0 && (
                        <li className="text-center text-xs text-muted-foreground">{rw ? "Nta mateka" : "No transactions yet"}</li>
                      )}
                    </ul>
                    {txs.length > 4 && (
                      <Button variant="ghost" className="h-9 w-full rounded-full text-xs" onClick={() => setHistory((h) => !h)}>
                        {history ? (rw ? "Hisha amateka" : "Hide history") : (rw ? "Reba amateka yose" : "Show full history")}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button className="h-11 min-w-0 flex-1 rounded-full px-2 text-xs" onClick={() => setForm({ type: "payment", party: r.p, balance: r.balance })}>{t("recordPayment")}</Button>
                      <Button variant="outline" className="h-11 min-w-0 flex-1 rounded-full px-2 text-xs" onClick={() => setForm({ type: "debt", party: r.p })}>{t("addDebtLbl")}</Button>
                      <Button variant="ghost" size="icon" className="h-11 shrink-0 rounded-full text-destructive" title={rw ? "Siba umuntu" : "Delete person"} aria-label={rw ? "Siba umuntu" : "Delete person"} onClick={() => setRemoving(r.p)}><Trash2 /></Button>
                    </div>
                    {kind === "customer" && r.p.phone && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-full text-success" onClick={() => reminder(r.p, r.balance, "wa")}><MessageCircle />WhatsApp</Button>
                        <Button variant="outline" className="flex-1 rounded-full" onClick={() => reminder(r.p, r.balance, "sms")}><MessageSquare />SMS</Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Drawer open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DrawerContent className="max-h-[92dvh]">
          {form && <CreditForm type={form.type} party={form.party} balance={form.balance ?? 0} kind={kind} onDone={() => setForm(null)} />}
        </DrawerContent>
      </Drawer>

      <Drawer open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{rw ? "Siba umuntu?" : "Delete person?"}</DrawerTitle>
            <DrawerDescription>{removing?.name} — {rw ? "Amateka yose azasibwa" : "All history will be removed"}</DrawerDescription>
          </DrawerHeader>
          <div className="flex gap-2 px-4 pb-8">
            <Button variant="outline" className="h-12 flex-1 rounded-full" onClick={() => setRemoving(null)}>{t("cancel")}</Button>
            <Button variant="destructive" className="h-12 flex-1 rounded-full" disabled={busy} onClick={async () => {
              if (!removing) return;
              setBusy(true);
              try {
                await deletePerson(removing.id);
                try { await trackAction("person_deleted"); await maybeSendUsage(); } catch { /* Analytics must never block a local save. */ }
                toast.success(rw ? "Byasibwe" : "Deleted"); setRemoving(null);
              }
              finally { setBusy(false); }
            }}>{rw ? "Siba" : "Delete"}</Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function CreditForm({ type, party, balance, kind, onDone }: { type: FormKind; party?: Party; balance: number; kind: PartyKind; onDone: () => void }) {
  const { t, lang } = useI18n();
  const rw = lang === "rw";
  const [name, setName] = useState(party?.name ?? "");
  const [phone, setPhone] = useState(party?.phone ?? "");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const title = type === "person" ? t("addParty") : type === "edit" ? t("edit") : type === "debt" ? t("addDebtLbl") : t("recordPayment");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const n = Number(amount);
      const days = isoToDueDays(deadline || undefined);
      if (type === "person") await addPerson(name, phone, kind, n || 0, desc, days);
      else if (party) {
        if (type === "edit") {
          if (!name.trim()) throw new Error(t("name"));
          await db.parties.update(party.id, { name: name.trim(), phone: phone.trim() });
        } else if (type === "debt") await addDebt(party.id, n, desc, days);
        else await pay(party.id, n, date);
      }
      // Log only the action category, never the party name, phone, amount, or description.
      const analyticsAction = type === "person"
        ? (kind === "customer" ? "customer_added" : "supplier_added")
        : type === "debt" ? "debt_added" : type === "payment" ? "payment_recorded" : null;
      if (analyticsAction) {
        try { await trackAction(analyticsAction); await maybeSendUsage(); } catch { /* Analytics must never block a local save. */ }
      }
      if (localStorage.getItem("ikayi-sync-mode") === "auto" && navigator.onLine) {
        const syncResult = await pushCredit();
        if (!syncResult.ok) toast.message(`Saved locally; cloud sync pending: ${syncResult.reason}`);
      }
      toast.success(t("save"));
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{title}{party ? ` — ${party.name}` : ""}</DrawerTitle>
        <DrawerDescription>{type === "payment" ? `${t("balance")}: ${fmt(balance)}` : rw ? "Amakuru y'ideni" : "Credit details"}</DrawerDescription>
      </DrawerHeader>
      <form onSubmit={submit} className="max-h-[70dvh] space-y-3 overflow-y-auto px-4 pb-7">
        {(type === "person" || type === "edit") && (
          <>
            <label className="block space-y-1 text-sm">{t("name")}<Input aria-label={t("name")} autoFocus required value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" /></label>
            <label className="block space-y-1 text-sm">{t("phone")}<Input aria-label={t("phone")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl" /></label>
          </>
        )}

        {type !== "edit" && type !== "payment" && (
          <>
            <label className="block space-y-1 text-sm">{t("description")}<Input aria-label={t("description")} value={desc} onChange={(e) => setDesc(e.target.value)} className="h-12 rounded-xl" placeholder={rw ? "Urugero: isuka, ifu…" : "e.g. flour, soap…"} /></label>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-sm font-medium"><CalendarDays className="size-4 text-primary" />{rw ? "Igihe cyo kwishyura (si ngombwa)" : "Payment deadline (optional)"}</p>
              <DeadlinePicker valueIso={deadline} onChange={setDeadline} lang={lang === "rw" ? "rw" : "en"} placeholder={rw ? "Hitamo itariki" : "Pick a date"} />
            </div>
            <label className="block space-y-1 text-sm">{t("amount")} (RWF)<Input aria-label={t("amount")} type="number" inputMode="numeric" min={type === "person" ? 0 : 1} step="1" required={type !== "person"} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl text-lg font-semibold" /></label>
          </>
        )}

        {type === "payment" && (
          <>
            <label className="block space-y-1 text-sm">{rw ? "Itariki y'ubwishyu" : "Payment date"}<Input aria-label={rw ? "Itariki y'ubwishyu" : "Payment date"} type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl" /></label>
            <label className="block space-y-1 text-sm">{t("amount")} (RWF)<Input aria-label={t("amount")} type="number" inputMode="numeric" min={1} step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl text-lg font-semibold" autoFocus /></label>
            <div className="grid grid-cols-3 gap-2">{[20, 50, 100].map((pct) => (<Button type="button" key={pct} variant={Number(amount) === Math.round((balance * pct) / 100) ? "default" : "outline"} className="h-11 rounded-full" onClick={() => setAmount(String(Math.round((balance * pct) / 100)))}>{pct}%</Button>))}</div>
          </>
        )}

        <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">{busy ? t("pleaseWait") : t("save")}</Button>
        <Button type="button" variant="ghost" className="w-full rounded-full" onClick={onDone}>{t("cancel")}</Button>
      </form>
    </>
  );
}
