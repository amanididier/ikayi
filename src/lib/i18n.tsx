import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "rw";

const dict = {
  sell: ["Sell", "Gurisha"],
  stock: ["Stock", "Ububiko"],
  credit: ["Credit", "Amadeni"],
  history: ["History", "Amateka"],
  settings: ["Settings", "Igenamiterere"],
  search: ["Search products…", "Shakisha ibicuruzwa…"],
  all: ["All", "Byose"],
  lowStock: ["Low stock", "Ububiko buke"],
  outOfStock: ["Out of stock", "Nta bubiko"],
  inStock: ["in stock", "mu bubiko"],
  costValue: ["Stock cost value", "Agaciro k'ububiko"],
  todayCash: ["Today's cash", "Amafaranga y'uyu munsi"],
  todayCredit: ["Today's credit", "Amadeni y'uyu munsi"],
  qty: ["Quantity", "Ingano"],
  total: ["Total", "Igiteranyo"],
  cash: ["Cash", "Amafaranga"],
  creditIdeni: ["Credit (Ideni)", "Ideni"],
  customerOptional: ["Customer (optional)", "Umukiriya (si ngombwa)"],
  noteOptional: ["Note (optional)", "Ibisobanuro (si ngombwa)"],
  confirmSale: ["Confirm sale", "Emeza igurisha"],
  pleaseWait: ["Please wait…", "Tegereza…"],
  phone: ["Phone", "Telefone"],
  customer: ["Customer", "Umukiriya"],
  owesMe: ["Who owes you", "Abandimo amadeni"],
  iOwe: ["Who you owe", "Abo ndimo amadeni"],
  balance: ["Balance", "Asigaye"],
  recordPayment: ["Record payment", "Andika ubwishyu"],
  amount: ["Amount", "Amafaranga"],
  remind: ["Remind", "Ibutsa"],
  addProduct: ["Add product", "Ongeraho igicuruzwa"],
  edit: ["Edit", "Hindura"],
  save: ["Save", "Bika"],
  cancel: ["Cancel", "Reka"],
  category: ["Category", "Icyiciro"],
  unit: ["Unit", "Igipimo"],
  takePhoto: ["Take product photo", "Fata ifoto y'igicuruzwa"],
  removePhoto: ["Remove photo", "Kuraho ifoto"],
  capturePhoto: ["Capture photo", "Fata ifoto"],
  closeCamera: ["Close camera", "Funga kamera"],
  retryCamera: ["Try camera again", "Ongera ufungure kamera"],
  cameraUnsupported: ["Camera access needs a supported browser and HTTPS.", "Kamera ikenera mushakisha iyishyigikira na HTTPS."],
  cameraDenied: ["Allow camera access and try again. The camera may be in use.", "Emera ko app ikoresha kamera wongere ugerageze. Kamera ishobora kuba ikoreshwa ahandi."],
  cameraStarting: ["Camera is still starting. Please try again.", "Kamera iracyafunguka. Ongera ugerageze."],
  cameraFailed: ["Could not capture this photo. Please try again.", "Ifoto ntiyafashwe. Ongera ugerageze."],
  cost: ["Cost price", "Igiciro cyo kurangura"],
  sellPrice: ["Selling price", "Igiciro cyo kugurisha"],
  openingStock: ["Opening stock", "Ububiko bwo gutangira"],
  minAlert: ["Minimum alert level", "Urugero ntarengwa"],
  stockIn: ["Receive", "Rangura"],
  count: ["Count", "Bara"],
  counted: ["Counted on shelf", "Ibyabaruwe"],
  system: ["System", "Sisitemu"],
  fromSupplier: ["On credit from supplier (optional)", "Ku ideni ry'urangura (si ngombwa)"],
  none: ["None", "Ntawe"],
  days: ["days", "iminsi"],
  overdue: ["Overdue", "Byarenze igihe"],
  payments: ["Payments", "Ubwishyu"],
  noItems: ["Nothing here yet", "Nta kintu kirimo"],
  cashCollected: ["Cash collected", "Amafaranga yinjiye"],
  creditGiven: ["Credit given", "Amadeni yatanzwe"],
  today: ["Today", "Uyu munsi"],
  reversed: ["Reversed", "Byasubijwe"],
  online: ["Online", "Kuri murandasi"],
  offline: ["Offline", "Nta murandasi"],
  pending: ["saved on this device", "bibitswe kuri aya makuru"],
  shopName: ["Shop name", "Izina ry'iduka"],
  currency: ["Currency", "Ifaranga"],
  exportJson: ["Export backup (JSON)", "Bika kopi (JSON)"],
  exportCsv: ["Export sales (CSV)", "Bika igurisha (CSV)"],
  reloadDemo: ["Reload demo data", "Garura amakuru y'igerageza"],
  deleteProduct: ["Delete product", "Siba igicuruzwa"],
  confirmDelete: ["Delete this product type? Past sales stay in history.", "Siba iki gicuruzwa? Amakuru y'ubucuruzi asigala."],
  emptyShop: ["No products yet. Tap + to add your first real item.", "Nta bicuruzwa. Kanda + wongereho igicuruzwa cyawe."],
  reset: ["Clear app data…", "Siba amakuru y'app…"],
  confirmReset: ["This only clears Ikayi Yange data in the app — not your whole phone.", "Ibi bisiba gusa amakuru ya Ikayi Yange muri app — si telefone yose."],
  addParty: ["Add person", "Ongeraho umuntu"],
  addDebtLbl: ["Add debt", "Ongeraho ideni"],
  description: ["Description", "Ibisobanuro"],
  supplier: ["Supplier", "Urangura"],
  dueIn: ["Credit period", "Igihe cy'ideni"],
  notEnough: ["Not enough stock", "Ububiko ntibuhagije"],
  profit: ["Profit", "Inyungu"],
  welcomeTitle: ["Welcome to Ikayi Yange", "Murakaza neza kuri Ikayi Yange"],
  welcomeBody: ["Sign in to back up your credit book to the cloud. You can skip and work offline.", "Injira kugira ngo ubike ikayi y'amadeni kuri cloud. Urashobora gusiga ukakoresha nta murandasi."],
  continueGoogle: ["Continue with Google", "Komeza na Google"],
  email: ["Email", "Imeyili"],
  password: ["Password", "Ijambo ry'ibanga"],
  signIn: ["Sign in", "Injira"],
  signUp: ["Sign up", "Iyandikishe"],
  skipForNow: ["Skip for now — use offline", "Siga ubu — koresha nta murandasi"],
  skipHint: ["Your data stays on this device until you sign in and sync.", "Amakuru yawe abikwa kuri aya makuru kugeza winjiye ukoherereze."],
} as const;

type DictKey = keyof typeof dict;

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
} | null>(null);

const LANG_KEY = "iy-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "rw";
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "en" || saved === "rw" ? saved : "rw";
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = useMemo(
    () => (key: DictKey) => {
      const row = dict[key];
      return lang === "en" ? row[0] : row[1];
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
