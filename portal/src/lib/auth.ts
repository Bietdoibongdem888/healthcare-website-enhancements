export type Tokens = { access:string; refresh:string };
const AK='hc_portal_access', RK='hc_portal_refresh';
export const save=(t:Tokens)=>{ localStorage.setItem(AK,t.access); localStorage.setItem(RK,t.refresh); };
export const get=():Tokens|null=>{ const a=localStorage.getItem(AK)||''; const r=localStorage.getItem(RK)||''; return a&&r?{access:a,refresh:r}:null; };
export const clear=()=>{ localStorage.removeItem(AK); localStorage.removeItem(RK); };
