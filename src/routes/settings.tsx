import { createFileRoute } from '@tanstack/react-router';
import { Shell } from '@/components/ikayi/Shell';
import { SettingsPage } from '@/components/ikayi/SettingsPage';
export const Route=createFileRoute('/settings')({head:()=>({meta:[{title:'Igenamiterere — Ikayi'},{name:'description',content:'Igenamiterere rya Ikayi, Cloud Sync n’ubufasha.'},{property:'og:title',content:'Igenamiterere — Ikayi'},{property:'og:description',content:'Igenamiterere rya konti ya Ikayi n’ubufasha.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <Shell><SettingsPage/></Shell>});
