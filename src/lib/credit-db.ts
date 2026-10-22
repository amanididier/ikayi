import Dexie, { type Table } from 'dexie';
export type PartyKind = 'customer' | 'supplier';
export type Party = { id: number; name: string; phone: string; kind: PartyKind; createdAt: number };
export type Entry = { id: number; partyId: number; amount: number; createdAt: number; description?: string; dueDays?: number };
export type UsageRow = { date: string; path: string; views: number; reported: number };
class CreditDB extends Dexie {
  parties!: Table<Party, number>;
  debts!: Table<Entry, number>;
  payments!: Table<Entry, number>;
  settings!: Table<{key:string;value:string}, string>;
  usage!: Table<UsageRow, [string, string]>;
  constructor() {
    super('ikayi-credit');
    this.version(1).stores({parties:'id,kind,name',debts:'id,partyId,createdAt',payments:'id,partyId,createdAt',settings:'key'});
    this.version(2).stores({parties:'id,kind,name',debts:'id,partyId,createdAt',payments:'id,partyId,createdAt',settings:'key',usage:'[date+path],date'});
    this.parties=this.table('parties'); this.debts=this.table('debts'); this.payments=this.table('payments'); this.settings=this.table('settings'); this.usage=this.table('usage');
  }
}
export const db = new CreditDB();
const id = () => Math.floor(Date.now()*1000+Math.random()*1000);
export const fmt = (n:number) => `${Math.round(n).toLocaleString('en-US')} RWF`;
export function summarize(parties:Party[],debts:Entry[],payments:Entry[],now=Date.now()) {
  const grouped = new Map<number,{debts:Entry[];payments:Entry[];balance:number}>();
  for(const p of parties) grouped.set(p.id,{debts:[],payments:[],balance:0});
  for(const d of debts) { const row=grouped.get(d.partyId); if(row){row.debts.push(d);row.balance+=d.amount;} }
  for(const pay of payments) { const row=grouped.get(pay.partyId); if(row){row.payments.push(pay);row.balance-=pay.amount;} }
  return parties.map(p=>{
    const row=grouped.get(p.id) ?? {debts:[],payments:[],balance:0};
    row.debts.sort((a,b)=>a.createdAt-b.createdAt);row.payments.sort((a,b)=>b.createdAt-a.createdAt);
    const oldest=row.debts[0]?.createdAt ?? p.createdAt;
    const deadlines=row.debts.flatMap(d=>d.dueDays && d.dueDays>0 ? [d.createdAt+d.dueDays*86400000] : []);
    const deadline=deadlines.length ? Math.min(...deadlines) : Infinity;
    return {p,...row,oldest,sortAt:Number.isFinite(deadline)?deadline:oldest,overdue:row.balance>0 && deadline<now};
  }).filter(r=>r.balance>0 || r.debts.length===0).sort((a,b)=>a.sortAt-b.sortAt || a.oldest-b.oldest);
}
export function positive(amount:number) { if(!Number.isFinite(amount)||amount<=0)throw new Error('Amafaranga agomba kurenga 0 / Amount must be positive'); }
export async function addPerson(name:string,phone:string,kind:PartyKind,amount:number,description:string,dueDays?:number) {
  if(!name.trim())throw new Error('Andika izina / Enter a name');
  if(!Number.isFinite(amount)||amount<0)throw new Error('Amafaranga ntabwo ari yo / Invalid amount');
  const partyId=id(); const createdAt=Date.now();
  await db.transaction('rw',db.parties,db.debts,async()=>{await db.parties.add({id:partyId,name:name.trim(),phone:phone.trim(),kind,createdAt}); if(amount>0)await db.debts.add({id:id(),partyId,amount,description,createdAt,...(dueDays?{dueDays}:{})});});
}
export async function addDebt(partyId:number,amount:number,description:string,dueDays?:number) {positive(amount);await db.debts.add({id:id(),partyId,amount,description,createdAt:Date.now(),...(dueDays?{dueDays}:{})});}
export async function pay(partyId:number,amount:number,date:string) {positive(amount);await db.payments.add({id:id(),partyId,amount,createdAt:new Date(date+'T12:00:00').getTime()});}
export async function deletePerson(partyId:number) {await db.transaction('rw',db.parties,db.debts,db.payments,async()=>{await db.debts.where('partyId').equals(partyId).delete();await db.payments.where('partyId').equals(partyId).delete();await db.parties.delete(partyId);});}
export async function clearDevice() {await db.transaction('rw',db.parties,db.debts,db.payments,async()=>{await db.parties.clear();await db.debts.clear();await db.payments.clear();});}
