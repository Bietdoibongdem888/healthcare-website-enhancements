import { API_URL } from './config';
import { get, save, clear } from './auth';
export async function api(path:string, init:RequestInit={}){
  const t=get(); const headers:any={'Content-Type':'application/json',...(init.headers||{})}; if(t?.access) headers['Authorization']=`Bearer ${t.access}`;
  const url = path.startsWith('http')?path:`${API_URL}${path}`;
  let res = await fetch(url,{...init,headers});
  if(res.status===401 && t){ const r=await fetch(`${API_URL}/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)}); if(r.ok){ const d=await r.json(); if(d?.access&&d?.refresh){ save({access:d.access,refresh:d.refresh}); headers['Authorization']=`Bearer ${d.access}`; res=await fetch(url,{...init,headers}); } } else { clear(); } }
  return res;
}
