import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_RW = ["Cy", "Mb", "Lb", "Wb", "Ng", "Ju", "Gp"];
const WEEKDAYS_LONG_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_LONG_RW = [
  "Ku cyumweru",
  "Ku wa mbere",
  "Ku wa kabiri",
  "Ku wa gatatu",
  "Ku wa kane",
  "Ku wa gatanu",
  "Ku wa gatandatu",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_RW = [
  "Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena",
  "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d!);
  if (dt.getFullYear() !== y || dt.getMonth() !== m! - 1 || dt.getDate() !== d) return null;
  return startOfDay(dt);
}

/** Convert optional ISO date to dueDays from today (whole days). */
export function isoToDueDays(iso: string | null | undefined): number | undefined {
  if (!iso) return undefined;
  const target = parseIso(iso);
  if (!target) return undefined;
  const today = startOfDay(new Date());
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff < 1) return 1;
  return diff;
}

type Props = {
  valueIso: string;
  onChange: (iso: string) => void;
  lang?: "en" | "rw";
  placeholder?: string;
};

export function DeadlinePicker({ valueIso, onChange, lang = "en", placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(valueIso);
  const selected = valueIso ? parseIso(valueIso) : null;

  const viewSeed = selected ?? startOfDay(new Date());
  const [viewY, setViewY] = useState(viewSeed.getFullYear());
  const [viewM, setViewM] = useState(viewSeed.getMonth());

  useEffect(() => {
    setManual(valueIso);
  }, [valueIso]);

  useEffect(() => {
    if (!open) return;
    const s = valueIso ? parseIso(valueIso) : null;
    if (s) {
      setViewY(s.getFullYear());
      setViewM(s.getMonth());
    }
  }, [open, valueIso]);

  const months = lang === "rw" ? MONTHS_RW : MONTHS_EN;
  const weekdays = lang === "rw" ? WEEKDAYS_RW : WEEKDAYS_EN;
  const weekdaysLong = lang === "rw" ? WEEKDAYS_LONG_RW : WEEKDAYS_LONG_EN;
  const today = startOfDay(new Date());

  const cells = useMemo(() => {
    const first = new Date(viewY, viewM, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const prevDays = new Date(viewY, viewM, 0).getDate();
    const out: { day: number; inMonth: boolean; date: Date }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      const day = prevDays - i;
      out.push({ day, inMonth: false, date: new Date(viewY, viewM - 1, day) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, inMonth: true, date: new Date(viewY, viewM, d) });
    }
    while (out.length % 7 !== 0) {
      const day = out.length - (startPad + daysInMonth) + 1;
      out.push({ day, inMonth: false, date: new Date(viewY, viewM + 1, day) });
    }
    return out;
  }, [viewY, viewM]);

  const label = selected
    ? `${weekdaysLong[selected.getDay()]}, ${selected.getDate()} ${months[selected.getMonth()]} ${selected.getFullYear()}`
    : placeholder || (lang === "rw" ? "Hitamo itariki" : "Pick a date");

  function pick(d: Date) {
    const iso = toIso(startOfDay(d));
    onChange(iso);
    setManual(iso);
    setOpen(false);
  }

  function applyManual() {
    let raw = manual.trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yy] = raw.split("/").map(Number);
      raw = `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
    const parsed = parseIso(raw);
    if (!parsed) return;
    onChange(toIso(parsed));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewM(m);
    setViewY(y);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-12 w-full items-center gap-2 rounded-xl border bg-card px-3 text-left text-sm",
          selected ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {selected && (
          <span
            role="button"
            tabIndex={0}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setManual("");
            }}
          >
            <X className="size-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl border bg-card shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-bold">{lang === "rw" ? "Hitamo itariki" : "Pick a date"}</p>
              <button type="button" className="rounded-full p-2 hover:bg-muted" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <button type="button" className="rounded-full p-2 hover:bg-muted" onClick={() => shiftMonth(-1)}>
                <ChevronLeft className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-lg border bg-card px-2 text-sm font-semibold"
                  value={viewM}
                  onChange={(e) => setViewM(Number(e.target.value))}
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-lg border bg-card px-2 text-sm font-semibold"
                  value={viewY}
                  onChange={(e) => setViewY(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => today.getFullYear() - 1 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="rounded-full p-2 hover:bg-muted" onClick={() => shiftMonth(1)}>
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0 px-3 pb-1 text-center text-[11px] font-semibold text-muted-foreground">
              {weekdays.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 px-3 pb-2">
              {cells.map((c, idx) => {
                const iso = toIso(startOfDay(c.date));
                const isSel = selected && toIso(selected) === iso;
                const isToday = toIso(today) === iso;
                const past = startOfDay(c.date).getTime() < today.getTime();
                return (
                  <button
                    type="button"
                    key={idx}
                    disabled={!c.inMonth || past}
                    onClick={() => pick(c.date)}
                    className={cn(
                      "mx-auto flex size-9 items-center justify-center rounded-full text-sm font-medium transition",
                      !c.inMonth && "text-muted-foreground/40",
                      c.inMonth && past && "text-muted-foreground/35",
                      c.inMonth && !past && !isSel && "hover:bg-primary/10",
                      isToday && !isSel && "ring-1 ring-primary/40",
                      isSel && "bg-primary font-bold text-primary-foreground shadow-md",
                    )}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <p className="text-[11px] text-muted-foreground">
                {lang === "rw"
                  ? "Cyangwa andika itariki (YYYY-MM-DD cyangwa DD/MM/YYYY)"
                  : "Or type a date (YYYY-MM-DD or DD/MM/YYYY)"}
              </p>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="2026-12-31"
                  className="h-11 min-w-0 flex-1 rounded-xl border bg-card px-3 text-sm"
                />
                <button type="button" onClick={applyManual} className="h-11 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold">
                  {lang === "rw" ? "Shyiramo" : "Set"}
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="h-10 flex-1 rounded-full border text-sm font-semibold text-muted-foreground"
                >
                  {lang === "rw" ? "Siba" : "Clear"}
                </button>
                <button type="button" onClick={() => pick(today)} className="h-10 flex-1 rounded-full border border-primary/30 text-sm font-semibold text-primary">
                  {lang === "rw" ? "Uyu munsi" : "Today"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
