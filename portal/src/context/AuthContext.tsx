import React,{createContext,useContext,useEffect,useState} from 'react';
import { api } from '../lib/api';
import { save, clear, get } from '../lib/auth';

type User={ id:number; email:string; phone?:string|null; first_name?:string; last_name?:string; role?:string; patient_id?:number }|null;

type RegisterPayload={ first_name:string; last_name:string; phone:string; email:string; password:string };
type Ctx={ user:User; login:(email:string,password:string)=>Promise<boolean>; register:(p:RegisterPayload)=>Promise<boolean>; logout:()=>Promise<void>; applyTokenPair:(pair:{access:string;refresh:string})=>Promise<boolean> };
const AuthCtx = createContext<Ctx>({ user:null, async login(){return false}, async register(){return false}, async logout(){}, async applyTokenPair(){return false} });

export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [user,setUser]=useState<User>(null);
  useEffect(()=>{ (async()=>{ if(get()){ const r=await api('/auth/me'); if(r.ok) setUser(await r.json()); } })(); },[]);
  async function login(email:string,password:string){ const r=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); if(!r.ok) return false; const d=await r.json(); if(d?.access&&d?.refresh){ save({access:d.access,refresh:d.refresh}); setUser(d.user||null); return true; } return false; }
  async function register(p:RegisterPayload){ const r=await api('/auth/register',{method:'POST',body:JSON.stringify(p)}); if(!r.ok) return false; const d=await r.json(); if(d?.access&&d?.refresh){ save({access:d.access,refresh:d.refresh}); setUser(d.user||null); return true; } return false; }
  async function logout(){ await api('/auth/logout',{method:'POST',body:JSON.stringify(get()||{})}); clear(); setUser(null); }
  async function applyTokenPair(pair:{access:string;refresh:string}){ if(!pair?.access||!pair?.refresh) return false; save(pair); const r=await api('/auth/me'); if(!r.ok){ clear(); return false; } setUser(await r.json()); return true; }
  return <AuthCtx.Provider value={{user,login,register,logout,applyTokenPair}}>{children}</AuthCtx.Provider>
}
export const useAuth=()=>useContext(AuthCtx);
