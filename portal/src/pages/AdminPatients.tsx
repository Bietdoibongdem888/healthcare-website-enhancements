import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function AdminPatients(){ const [rows,setRows]=useState<any[]>([]); const [form,setForm]=useState<any>({ first_name:'', last_name:'', contact_no:'', email:'' }); const [editId,setEditId]=useState<number|null>(null); const [msg,setMsg]=useState('');
  async function load(){ const r=await api('/patients'); if(r.ok) setRows(await r.json()); }
  useEffect(()=>{ load(); },[]);
  async function save(){ setMsg(''); const url = editId? `/patients/${editId}` : '/patients'; const method = editId? 'PUT':'POST'; const r=await api(url,{method,body:JSON.stringify(form)}); setMsg(r.ok?'Saved':'Failed'); setForm({ first_name:'', last_name:'', contact_no:'', email:'' }); setEditId(null); load(); }
  return <div className='card'>
    <h3>Admin: Patients</h3>
    <div className='grid grid-2'>
      <div><label>First name</label><input className='input' value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} /></div>
      <div><label>Last name</label><input className='input' value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} /></div>
      <div><label>Contact</label><input className='input' value={form.contact_no} onChange={e=>setForm({...form,contact_no:e.target.value})} /></div>
      <div><label>Email</label><input className='input' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
    </div>
    <div className='row'><button className='btn' onClick={save}>{editId? 'Update':'Create'}</button><span>{msg}</span></div>
    <ul className='list'>
      {rows.map(p=> <li key={p.patient_id}>
        <b>{p.first_name} {p.last_name}</b> — {p.email||'-'}
        <div className='row' style={{marginTop:6}}>
          <button className='input' onClick={()=>{ setEditId(p.patient_id); setForm({ first_name:p.first_name, last_name:p.last_name, contact_no:p.contact_no||'', email:p.email||'' }); }}>Edit</button>
        </div>
      </li>)}
    </ul>
  </div>
}
