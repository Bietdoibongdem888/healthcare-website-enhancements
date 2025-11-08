import { useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function Booking(){ const [docs,setDocs]=useState<any[]>([]); const [doctor,setDoctor]=useState(''); const [date,setDate]=useState(''); const [time,setTime]=useState(''); const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [notes,setNotes]=useState(''); const [msg,setMsg]=useState('');
  useEffect(()=>{ (async()=>{ const r=await api('/doctors'); if(r.ok) setDocs(await r.json()); })(); },[]);
  async function submit(e:any){ e.preventDefault(); setMsg(''); if(!doctor||!date||!time){ setMsg('Please fill all'); return; } const start=new Date(`${date}T${time}:00Z`).toISOString(); const parts=name.trim().split(' '); const last=parts.pop()||'Client'; const first=parts.join(' ')||'User'; const r=await api('/appointments',{method:'POST',body:JSON.stringify({doctor_id:Number(doctor),start_time:start,notes,patient:{first_name:first,last_name:last,contact_no:phone}})}); setMsg(r.ok?'Booked!':'Failed'); }
  return <div className='card' style={{maxWidth:620}}>
    <h3>Book an Appointment</h3>
    <div className='grid'>
      <div><label>Doctor</label><select className='select' value={doctor} onChange={e=>setDoctor(e.target.value)}><option value=''>-- Select --</option>{docs.map(d=><option key={d.doctor_id} value={d.doctor_id}>{d.first_name} {d.last_name} — {d.specialty}</option>)}</select></div>
      <div className='row'><div style={{flex:1}}><label>Date</label><input className='input' type='date' value={date} onChange={e=>setDate(e.target.value)} /></div><div style={{flex:1}}><label>Time</label><input className='input' type='time' value={time} onChange={e=>setTime(e.target.value)} /></div></div>
      <div className='row'><div style={{flex:1}}><label>Name</label><input className='input' value={name} onChange={e=>setName(e.target.value)} /></div><div style={{flex:1}}><label>Phone</label><input className='input' value={phone} onChange={e=>setPhone(e.target.value)} /></div></div>
      <div><label>Notes</label><input className='input' value={notes} onChange={e=>setNotes(e.target.value)} /></div>
      <div className='row'><button className='btn' onClick={submit}>Book</button><span>{msg}</span></div>
    </div>
  </div>
}
