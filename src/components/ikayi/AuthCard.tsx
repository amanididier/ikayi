import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { MIN_PASSWORD, signIn, signUp, type LoginType } from "@/lib/auth";
import logo from "@/assets/ikayi-logo.png";

export function AuthCard({ onAuthed, onOffline }: { onAuthed: () => void; onOffline?: () => void }) {
  const { lang, t } = useI18n();
  const rw = lang === "rw";
  const [tab, setTab] = useState<LoginType>("phone");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [show, setShow] = useState(false);
  const [ask, setAsk] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const res = await signIn({ loginType: tab, identifier, password });
        if (res.ok) {
          toast.success(rw ? "Winjiye neza" : "Signed in");
          onAuthed();
          return;
        }
        if (res.error === "no_account" || res.error === "mismatch") {
          setAsk(true);
          return;
        }
        if (res.error === "confirmation_required") {
          toast.error(rw ? "Emeza email yawe mbere" : "Confirm your email first");
          return;
        }
        toast.error(rw ? "Telefone/email cyangwa ijambo ry'ibanga ntabwo ari byo" : "Wrong phone/email or password");
        return;
      }

      const res = await signUp({ loginType: tab, identifier, password });
      if (res.ok) {
        toast.success(rw ? "Konti yafunguwe" : "Account created");
        onAuthed();
        return;
      }
      if (res.error === "exists") {
        toast.message(rw ? "Konti isanzwe ihari — injira" : "Account already exists — sign in");
        setMode("login");
        return;
      }
      if (res.error === "bad_password") {
        toast.error(rw ? `Ijambo ry'ibanga rigomba kuba byibuze inyuguti ${MIN_PASSWORD}` : `Password must be at least ${MIN_PASSWORD} characters`);
        return;
      }
      toast.error(res.detail || (rw ? "Kwiyandikisha byanze" : "Sign up failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay">
      <section className="auth-card no-scrollbar" role="dialog" aria-modal="true" aria-label={rw ? "Injira muri Ikayi" : "Sign in to Ikayi"}>
        <img src={logo} alt="Ikayi" className="mx-auto size-20 rounded-2xl" />
        <h2 className="mt-5 text-center text-2xl font-bold">
          {mode === "login" ? (rw ? "Murakaza neza kuri Ikayi" : "Welcome to Ikayi") : rw ? "Fungura konti ya Ikayi" : "Create your Ikayi account"}
        </h2>
        <p className="mb-6 mt-2 text-center text-sm text-muted-foreground">{rw ? "Ikayi y'amadeni yawe" : "Your personal credit book"}</p>

        {ask ? (
          <div className="space-y-4">
            <p className="text-center font-semibold">{rw ? "Uri mushya kuri Ikayi?" : "New to Ikayi?"}</p>
            <p className="text-center text-xs text-muted-foreground">
              {rw ? "Nta konti yabonetse. Uri gushaka kwiyandikisha?" : "No account found. Would you like to sign up?"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 rounded-full" onClick={() => setAsk(false)}>
                {rw ? "Oya" : "No"}
              </Button>
              <Button className="h-11 rounded-full" onClick={() => { setAsk(false); setMode("signup"); }}>
                {rw ? "Yego" : "Yes"}
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="tablist">
              {(["phone", "email"] as const).map((k) => (
                <Button key={k} type="button" role="tab" aria-selected={tab === k} variant="ghost" className={`h-10 rounded-full ${tab === k ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`} onClick={() => setTab(k)}>
                  {k === "phone" ? <Phone className="size-4" /> : <Mail className="size-4" />}
                  {t(k)}
                </Button>
              ))}
            </div>

            <label className="block space-y-1.5 text-sm font-medium">
              {t(tab)}
              <Input type={tab === "phone" ? "tel" : "email"} autoComplete="username" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 rounded-xl" placeholder={tab === "phone" ? "07•• ••• •••" : "izina@example.com"} />
            </label>

            <label className="block space-y-1.5 text-sm font-medium">
              {t("password")}
              <div className="relative">
                <Input type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl pr-12" placeholder={rw ? `Byibuze ${MIN_PASSWORD}` : `At least ${MIN_PASSWORD}`} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"}>
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">
              {busy ? t("pleaseWait") : mode === "login" ? t("signIn") : t("signUp")}
              <ArrowRight className="size-4" />
            </Button>

            <button type="button" className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login"
                ? rw ? "Uri mushya? Fungura konti" : "New here? Create an account"
                : rw ? "Usanzwe ufite konti? Injira" : "Already have an account? Sign in"}
            </button>

            {onOffline && (
              <Button type="button" variant="ghost" className="w-full rounded-full text-xs" onClick={onOffline}>
                {rw ? "Komeza kuri iyi telefone gusa" : "Continue on this device only"}
              </Button>
            )}
          </form>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Ikayi · {rw ? "Amadeni yawe" : "Your credit book"}
        </p>
      </section>
    </div>
  );
}
