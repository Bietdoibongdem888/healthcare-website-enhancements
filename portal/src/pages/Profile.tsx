import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function Profile(){ const [user,setUser]=useState<any>(null); const [appts,setAppts]=useState<any[]>([]); const [recs,setRecs]=useState<any[]>([]); const [reschedId,setReschedId]=useState<number|null>(null); const [date,setDate]=useState(''); const [time,setTime]=useState(''); const [msg,setMsg]=useState('');
  async function load(){ const u=await api('/auth/me'); if(u.ok){ const du=await u.json(); setUser(du); const a=await api('/appointments/mine'); if(a.ok) setAppts(await a.json()); const r=await api('/records/mine'); if(r.ok) setRecs(await r.json()); } }
  useEffect(()=>{ load(); },[]);
  if(!user) return <div className='card'>Login required.</div>;
  return <div className='grid'>
    <div className='card'>
      <h3>My Profile</h3>
      <div>Name: {user.first_name} {user.last_name}</div>
      <div>Email: {user.email}</div>
    </div>
    <div className='card'>
      <h3>My Appointments</h3>
      <ul className='list'>
        {appts.map(a=> <li key={a.appointment_id}>
          <b>{new Date(a.start_time).toLocaleString()}</b> — {a.status}
          <div className='row' style={{marginTop:8}}>
            <button className='input' onClick={async()=>{ await api(`/appointments/${a.appointment_id}/cancel`,{method:'POST'}); setMsg('Canceled'); load(); }}>Cancel</button>
            <button className='input' onClick={()=>{ setReschedId(a.appointment_id); }}>Reschedule</button>
          </div>
          {reschedId===a.appointment_id && (
            <div className='row' style={{marginTop:8}}>
              <input className='input' type='date' value={date} onChange={e=>setDate(e.target.value)} />
              <input className='input' type='time' value={time} onChange={e=>setTime(e.target.value)} />
              <button className='btn' onClick={async()=>{ const start=new Date(`${date}T${time}:00Z`).toISOString(); await api(`/appointments/${a.appointment_id}/reschedule`,{method:'POST',body:JSON.stringify({start_time:start})}); setMsg('Rescheduled'); setReschedId(null); load(); }}>Save</button>
            </div>
          )}
        </li>)}
      </ul>
      {msg && <div>{msg}</div>}
    </div>
    <div className='card'>
      <h3>My Records</h3>
      <ul className='list'>
        {recs.map(r=> <li key={r.record_id}><b>{r.title}</b> — {new Date(r.created_at).toLocaleString()}</li>)}
      </ul>
    </div>
  </div>
}
