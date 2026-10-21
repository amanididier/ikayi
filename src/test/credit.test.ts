import 'fake-indexeddb/auto';
import { describe,it,expect,beforeEach } from 'vitest';
import { db,addPerson,addDebt,pay,summarize,deletePerson,clearDevice } from '@/lib/credit-db';
beforeEach(async()=>{await clearDevice();});
describe('Ikayi credit book',()=>{
 it('separates people who owe me from people I owe',async()=>{await addPerson('A','', 'customer',100,'');await addPerson('B','','supplier',200,'');expect(await db.parties.where('kind').equals('customer').count()).toBe(1);expect(await db.parties.where('kind').equals('supplier').count()).toBe(1);});
 it('subtracts recorded payments from debt',async()=>{await addPerson('A','','customer',10000,'Loan');const p=(await db.parties.toArray())[0];if(!p)throw new Error('missing party');await pay(p.id,2000,'2026-10-21');expect(summarize([p],await db.debts.toArray(),await db.payments.toArray())[0]?.balance).toBe(8000);});
 it('adds new debt to the same person',async()=>{await addPerson('A','','customer',100,'');const p=(await db.parties.toArray())[0];if(!p)throw new Error('missing party');await addDebt(p.id,50,'');expect(summarize([p],await db.debts.toArray(),[])[0]?.balance).toBe(150);});
 it('removes person and their credit history together',async()=>{await addPerson('A','','customer',100,'');const p=(await db.parties.toArray())[0];if(!p)throw new Error('missing party');await pay(p.id,20,'2026-10-21');await deletePerson(p.id);expect(await db.parties.count()).toBe(0);expect(await db.debts.count()).toBe(0);expect(await db.payments.count()).toBe(0);});
 it('hides settled balances as in the reference',()=>{expect(summarize([{id:1,name:'A',phone:'',kind:'customer',createdAt:1}],[{id:2,partyId:1,amount:100,createdAt:1}],[{id:3,partyId:1,amount:100,createdAt:2}])).toHaveLength(0);});
 it('rejects nonpositive payments',async()=>{await expect(pay(1,0,'2026-10-21')).rejects.toThrow();});
});