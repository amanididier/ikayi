import { createFileRoute } from '@tanstack/react-router';
import { Shell } from '@/components/ikayi/Shell';
import { CreditBook } from '@/components/ikayi/CreditBook';
export const Route=createFileRoute('/i-owe')({head:()=>({meta:[{title:'Abo mbereyemo amadeni — Ikayi'},{name:'description',content:'Andika amadeni ugomba kwishyura n’ubwishyu bwawe muri Ikayi.'},{property:'og:title',content:'Abo mbereyemo amadeni — Ikayi'},{property:'og:description',content:'Bika amadeni ugomba kwishyura muri Ikayi.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <Shell><CreditBook kind="supplier"/></Shell>});
