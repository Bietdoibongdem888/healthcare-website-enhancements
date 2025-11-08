import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function Doctors(){ const [rows,setRows]=useState<any[]>([]); const [q,setQ]=useState(''); const [spec,setSpec]=useState(''); const [dist,setDist]=useState('');
  useEffect(()=>{ (async()=>{ const r=await api(`/doctors?q=${encodeURIComponent(q)}&specialty=${encodeURIComponent(spec)}&district=${encodeURIComponent(dist)}`); if(r.ok) setRows(await r.json()); })(); },[q,spec,dist]);
  return <div className='card'>
    <h3>Doctors</h3>
    <div className='grid grid-2'>
      <div><label>Search</label><input className='input' placeholder='name/specialty' value={q} onChange={e=>setQ(e.target.value)} /></div>
      <div className='row'><input className='input' placeholder='Specialty' value={spec} onChange={e=>setSpec(e.target.value)} /><input className='input' placeholder='District' value={dist} onChange={e=>setDist(e.target.value)} /></div>
    </div>
    <ul className='list'>
      {rows.map(d=> <li key={d.doctor_id}><b>{d.first_name} {d.last_name}</b> — {d.specialty} <span style={{color:'#9aa6b2'}}>({d.hospital||'-'}, {d.district||'-'})</span></li>)}
    </ul>
  </div>
}
