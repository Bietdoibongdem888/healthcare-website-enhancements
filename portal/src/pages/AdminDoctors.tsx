import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function AdminDoctors(){ const [rows,setRows]=useState<any[]>([]); const [form,setForm]=useState<any>({ first_name:'', last_name:'', specialty:'', hospital:'', district:'' }); const [editId,setEditId]=useState<number|null>(null); const [msg,setMsg]=useState('');
  async function load(){ const r=await api('/doctors'); if(r.ok) setRows(await r.json()); }
  useEffect(()=>{ load(); },[]);
  async function save(){ setMsg(''); const url = editId? `/doctors/${editId}` : '/doctors'; const method = editId? 'PUT':'POST'; const r=await api(url,{method,body:JSON.stringify(form)}); setMsg(r.ok?'Saved':'Failed'); setForm({ first_name:'', last_name:'', specialty:'', hospital:'', district:'' }); setEditId(null); load(); }
  return <div className='card'>
    <h3>Admin: Doctors</h3>
    <div className='grid grid-2'>
      <div><label>First name</label><input className='input' value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} /></div>
      <div><label>Last name</label><input className='input' value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} /></div>
      <div><label>Specialty</label><input className='input' value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})} /></div>
      <div><label>Hospital</label><input className='input' value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})} /></div>
      <div><label>District</label><input className='input' value={form.district} onChange={e=>setForm({...form,district:e.target.value})} /></div>
    </div>
    <div className='row'><button className='btn' onClick={save}>{editId? 'Update':'Create'}</button><span>{msg}</span></div>
    <ul className='list'>
      {rows.map(d=> <li key={d.doctor_id}>
        <b>{d.first_name} {d.last_name}</b> — {d.specialty} <span style={{color:'#9aa6b2'}}>({d.hospital||'-'}, {d.district||'-'})</span>
        <div className='row' style={{marginTop:6}}>
          <button className='input' onClick={()=>{ setEditId(d.doctor_id); setForm({ first_name:d.first_name, last_name:d.last_name, specialty:d.specialty, hospital:d.hospital||'', district:d.district||'' }); }}>Edit</button>
        </div>
      </li>)}
    </ul>
  </div>
}
