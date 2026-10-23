import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "rw";

const dict = {
  sell: ["Sell", "Gurisha"],
  stock: ["Stock", "Ububiko"],
  credit: ["Credit", "Amadeni"],
  history: ["History", "Amateka"],
  settings: ["Settings", "Igenamiterere"],
  search: ["Search products…", "Shakisha…"],
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
  takePhoto: ["Take product photo", "Fata ifoto"],
  removePhoto: ["Remove photo", "Kuraho ifoto"],
  capturePhoto: ["Capture photo", "Fata ifoto"],
  closeCamera: ["Close camera", "Funga kamera"],
  retryCamera: ["Try camera again", "Ongera ugerageze"],
  cameraUnsupported: ["Camera needs HTTPS.", "Kamera ikenera HTTPS."],
  cameraDenied: ["Allow camera access.", "Emera kamera."],
  cameraStarting: ["Camera starting…", "Kamera iracyafunguka…"],
  cameraFailed: ["Could not capture photo.", "Ifoto ntiyafashwe."],
  cost: ["Cost price", "Igiciro cyo kurangura"],
  sellPrice: ["Selling price", "Igiciro cyo kugurisha"],
  openingStock: ["Opening stock", "Ububiko bwo gutangira"],
  minAlert: ["Minimum alert", "Urugero ntarengwa"],
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
  cloudSync: ["Cloud sync", "Guhuza amakuru kuri cloud"],
  autoSync: ["Sync automatically when online", "Guhuza amakuru byikora iyo ufite murandasi"],
  syncNow: ["Sync now", "Huza amakuru ubu"],
  syncDone: ["Sync completed", "Amakuru yahujwe neza"],
  pending: ["saved on this device", "bibitswe kuri aya makuru"],
  shopName: ["Shop name", "Izina ry'iduka"],
  currency: ["Currency", "Ifaranga"],
  exportJson: ["Export backup (JSON)", "Bika kopi (JSON)"],
  exportCsv: ["Export sales (CSV)", "Bika igurisha (CSV)"],
  reloadDemo: ["Reload demo data", "Garura amakuru y'igerageza"],
  deleteProduct: ["Delete product", "Siba igicuruzwa"],
  confirmDelete: ["Delete this product?", "Siba iki gicuruzwa?"],
  emptyShop: ["No products yet.", "Nta bicuruzwa."],
  reset: ["Clear app data…", "Siba amakuru y'app…"],
  confirmReset: ["This only clears Ikayi Yange data — not your phone.", "Ibi bisiba gusa amakuru ya Ikayi Yange — si telefone."],
  addParty: ["Add person", "Ongeraho umuntu"],
  addDebtLbl: ["Add debt", "Ongeraho ideni"],
  description: ["Description", "Ibisobanuro"],
  supplier: ["Supplier", "Urangura"],
  dueIn: ["Credit period", "Igihe cy'ideni"],
  notEnough: ["Not enough stock", "Ububiko ntibuhagije"],
  profit: ["Profit", "Inyungu"],
  welcomeTitle: ["Welcome to Ikayi Yange", "Murakaza neza kuri Ikayi Yange"],
  welcomeBody: ["Sign in to back up to the cloud. You can skip and work offline.", "Injira kugira ngo ubike kuri cloud. Urashobora gusiga."],
  continueGoogle: ["Continue with Google", "Komeza na Google"],
  email: ["Email", "Imeyili"],
  password: ["Password", "Ijambo ry'ibanga"],
  signIn: ["Sign in", "Injira"],
  signUp: ["Sign up", "Iyandikishe"],
  skipForNow: ["Skip for now — use offline", "Siga ubu — koresha nta murandasi"],
  skipHint: ["Data stays on this device until you sync.", "Amakuru abikwa kuri telefone kugeza usync."],
  logout: ["Log out", "Sohoka"],
  contactDev: ["Need help?", "Ukeneye ubufasha?"],
  resetPhoneDone: ["App data cleared on this device", "Amakuru y'app yasibwe"],
  left: ["left", "asigaye"],
  low: ["Low", "Bike"],
  out: ["Out", "Byarangiye"],
  stockValue: ["Stock value", "Agaciro k'ububiko"],
  salesValue: ["Sales value", "Agaciro k'igurisha"],
  lowBanner: ["Low stock items", "Ibicuruzwa by'ububiko buke"],
  quantity: ["Quantity", "Ingano"],
  price: ["Price", "Igiciro"],
  complete: ["Complete", "Byarangiye"],
  newCustomer: ["New customer", "Umukiriya mushya"],
  name: ["Name", "Izina"],
  sold: ["Sold", "Byagurishijwe"],
  undo: ["Undo", "Subiza"],
} as const;

type DictKey = keyof typeof dict;

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
} | null>(null);

/** WhatsApp / SMS reminder body (debtors). */
export function reminderText(lang: Lang, name: string, amount: string, shop: string) {
  return lang === "rw"
    ? `Muraho ${name}, turabibutsa ko mufite ideni rya ${amount} muri ${shop}. Murakoze cyane!`
    : `Hello ${name}, a friendly reminder that you have a balance of ${amount} at ${shop}. Thank you!`;
}

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
  const t = (key: DictKey) => {
    const row = dict[key];
    // A missing translation should never crash the whole route at runtime.
    if (!row) return key;
    return lang === "en" ? row[0] : row[1];
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
