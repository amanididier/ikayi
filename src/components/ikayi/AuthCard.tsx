import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import logo from '@/assets/ikayi-logo.png';
export function AuthCard({onOffline}:{onOffline:()=>void}) {
 const {lang,t}=useI18n(); const rw=lang==='rw'; const [tab,setTab]=useState<'phone'|'email'>('phone'); const [mode,setMode]=useState<'login'|'signup'>('login'); const [show,setShow]=useState(false); const [ask,setAsk]=useState(false);const [notice,setNotice]=useState('');
 return <div className="auth-overlay"><section className="auth-card" role="dialog" aria-modal="true" aria-label={rw?'Injira muri Ikayi':'Sign in to Ikayi'}>
 <img src={logo} alt="Ikayi" className="mx-auto size-20 rounded-2xl"/><h2 className="mt-5 text-center text-2xl font-bold">{mode==='login'?(rw?'Murakaza neza kuri Ikayi':'Welcome to Ikayi'):(rw?'Fungura konti ya Ikayi':'Create your Ikayi account')}</h2>
 <p className="mb-6 mt-2 text-center text-sm text-muted-foreground">{rw?'Ikayi y’amadeni yawe':'Your personal credit book'}</p>
 {ask?<div className="space-y-4"><p className="text-center font-semibold">{rw?'Uri mushya kuri Ikayi?':'New to Ikayi?'}</p><div className="grid grid-cols-2 gap-3"><Button variant="outline" className="rounded-full" onClick={()=>setAsk(false)}>{rw?'Oya':'No'}</Button><Button className="rounded-full" onClick={()=>{setAsk(false);setMode('signup');setNotice('');}}>{rw?'Yego':'Yes'}</Button></div></div>:<form className="space-y-4" onSubmit={e=>{e.preventDefault();setNotice(rw?'Konti na Cloud Sync biracyategereje guhuza serivisi yawe isanzwe. Ushobora gukoresha Ikayi kuri iyi telefone.':'Accounts and Cloud Sync are waiting for your existing service connection. You can use Ikayi on this device.');}}>
 <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="tablist">{(['phone','email'] as const).map(k=><Button key={k} type="button" role="tab" aria-selected={tab===k} variant="ghost" className={`h-10 rounded-full ${tab===k?'bg-card text-primary shadow-card':'text-muted-foreground'}`} onClick={()=>setTab(k)}>{k==='phone'?<Phone/>:<Mail/>}{t(k)}</Button>)}</div>
 <label className="block space-y-1.5 text-sm font-medium">{t(tab)}<Input type={tab==='phone'?'tel':'email'} autoComplete="username" required className="h-12 rounded-xl" placeholder={tab==='phone'?'07•• ••• •••':'izina@example.com'}/></label>
 <label className="block space-y-1.5 text-sm font-medium">{t('password')}<div className="relative"><Input type={show?'text':'password'} required minLength={mode==='signup'?6:1} autoComplete={mode==='signup'?'new-password':'current-password'} className="h-12 rounded-xl pr-12"/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.5 rounded-full" title={show?'Hide password':'Show password'} aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</Button></div></label>
 {notice&&<p role="status" className="rounded-xl bg-secondary p-3 text-xs leading-relaxed">{notice}</p>}
 <Button type="submit" className="h-12 w-full rounded-full">{t(mode==='login'?'signIn':'signUp')}<ArrowRight/></Button>
 <Button type="button" variant="link" className="h-auto w-full whitespace-normal" onClick={()=>mode==='login'?setAsk(true):setMode('login')}>{t(mode==='login'?'needSignUp':'needLogin')}</Button>
 </form>}
 <div className="mt-6 border-t pt-4"><Button variant="ghost" className="h-auto w-full whitespace-normal text-muted-foreground" onClick={onOffline}>{rw?'Koresha kuri iyi telefone':'Continue on this device'}<ArrowRight/></Button><p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="size-3.5"/>{rw?'Amakuru abikwa kuri iyi telefone gusa':'Data is saved on this device only'}</p></div>
 </section></div>;
}
