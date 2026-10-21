import { createFileRoute } from '@tanstack/react-router';
import { Shell } from '@/components/ikayi/Shell';
import { CreditBook } from '@/components/ikayi/CreditBook';
export const Route=createFileRoute('/')({head:()=>({meta:[{title:'Ikayi — Abarimo amadeni'},{name:'description',content:'Ikayi: bika amadeni, ubwishyu n’amakuru y’abakubereyemo amadeni.'},{property:'og:title',content:'Ikayi — Abarimo amadeni'},{property:'og:description',content:'Ikayi yawe y’amadeni n’ubwishyu.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <Shell><CreditBook kind="customer"/></Shell>});
