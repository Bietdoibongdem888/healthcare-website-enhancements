import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type Doctor = {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  hospital?: string;
};

type Availability = {
  availability_id: number;
  start_time: string;
  end_time: string;
  max_patients: number;
  booked_patients: number;
  status: string;
  notes?: string | null;
};

type Summary = {
  by_status: { status: string; total: number }[];
  top_doctors: { doctor_id: number; name: string; upcoming: number }[];
  daily_trend: { day: string; total: number }[];
  utilization: {
    availability_id: number;
    doctor_id: number;
    start_time: string;
    end_time: string;
    max_patients: number;
    booked_patients: number;
    utilization: number;
  }[];
};

const initialForm = {
  date: '',
  start: '',
  end: '',
  max_patients: 4,
  notes: '',
};

export default function AdminAvailability() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string>('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api('/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        if (data.length) setDoctorId(data[0].doctor_id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    loadSlots(doctorId);
  }, [doctorId]);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSlots = async (id: number) => {
    setLoading(true);
    setMessage('');
    const res = await api(`/doctors/${id}/availability?from=${encodeURIComponent(new Date().toISOString())}`);
    if (res.ok) {
      const data = await res.json();
      setSlots(data);
    } else {
      setSlots([]);
    }
    setLoading(false);
  };

  const loadSummary = async () => {
    const res = await api('/appointments/stats/summary');
    if (res.ok) {
      setSummary(await res.json());
    }
  };

  const saveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    setMessage('');
    if (!form.date || !form.start || !form.end) {
      setMessage('Please fill all required fields.');
      return;
    }
    const start = new Date(`${form.date}T${form.start}:00Z`);
    const end = new Date(`${form.date}T${form.end}:00Z`);
    if (end <= start) {
      setMessage('End time must be after start time.');
      return;
    }
    const res = await api(`/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        max_patients: Number(form.max_patients),
        notes: form.notes || undefined,
      }),
    });
    if (res.ok) {
      setForm(initialForm);
      loadSlots(doctorId);
      loadSummary();
      setMessage('Slot created.');
    } else {
      const err = await res.json().catch(() => ({ message: 'Failed to create slot' }));
      setMessage(err?.message || 'Failed to create slot');
    }
  };

  const removeSlot = async (availabilityId: number) => {
    if (!doctorId) return;
    setMessage('');
    const res = await api(`/doctors/${doctorId}/availability/${availabilityId}`, { method: 'DELETE' });
    if (res.ok) {
      loadSlots(doctorId);
      loadSummary();
      setMessage('Removed slot.');
    } else {
      const err = await res.json().catch(() => ({ message: 'Unable to remove slot' }));
      setMessage(err?.message || 'Unable to remove slot');
    }
  };

  const doctorOptions = useMemo(
    () => doctors.map((d) => ({ value: d.doctor_id, label: `${d.first_name} ${d.last_name} – ${d.specialty}` })),
    [doctors]
  );

  return (
    <div className='card'>
      <h3>Admin: Doctor Availability</h3>
      <p className='muted'>Manage availability slots used by the booking flow. A slot is required for every appointment.</p>

      <div className='grid grid-2'>
        <div>
          <label>Doctor</label>
          <select
            className='select'
            value={doctorId ?? ''}
            onChange={(e) => setDoctorId(e.target.value ? Number(e.target.value) : null)}
          >
            {doctorOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Summary</label>
          <div className='grid grid-2'>
            <div className='badge'>
              Scheduled:
              {' '}
              {summary?.by_status.find((s) => s.status === 'scheduled')?.total ?? 0}
            </div>
            <div className='badge'>
              Completed:
              {' '}
              {summary?.by_status.find((s) => s.status === 'completed')?.total ?? 0}
            </div>
            <div className='badge'>
              Canceled:
              {' '}
              {summary?.by_status.find((s) => s.status === 'canceled')?.total ?? 0}
            </div>
            <div className='badge'>
              Active slots:
              {' '}
              {summary?.utilization.length ?? 0}
            </div>
          </div>
        </div>
      </div>

      <form className='grid grid-2' onSubmit={saveSlot} style={{ marginTop: 24 }}>
        <div>
          <label>Date</label>
          <input
            type='date'
            className='input'
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className='row'>
          <div style={{ flex: 1 }}>
            <label>Start Time</label>
            <input
              type='time'
              className='input'
              value={form.start}
              onChange={(e) => setForm((prev) => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>End Time</label>
            <input
              type='time'
              className='input'
              value={form.end}
              onChange={(e) => setForm((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label>Capacity (max patients)</label>
          <input
            type='number'
            className='input'
            min={1}
            max={20}
            value={form.max_patients}
            onChange={(e) => setForm((prev) => ({ ...prev, max_patients: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label>Notes</label>
          <input
            className='input'
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
        <div className='row' style={{ alignItems: 'flex-end' }}>
          <button className='btn' type='submit'>
            Create slot
          </button>
          {message && <span>{message}</span>}
        </div>
      </form>

      <hr style={{ margin: '24px 0' }} />
      <h4>Upcoming slots</h4>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className='list'>
          {slots.length === 0 && <li>No availability configured.</li>}
          {slots.map((slot) => (
            <li key={slot.availability_id}>
              <b>{new Date(slot.start_time).toLocaleString()}</b>
              {' – '}
              {new Date(slot.end_time).toLocaleString()}
              {' | Capacity '}
              {slot.booked_patients}
              {' / '}
              {slot.max_patients}
              {' | '}
              <span className={slot.status === 'available' ? 'badge' : 'badge badge-muted'}>{slot.status}</span>
              {slot.notes ? <div className='muted'>{slot.notes}</div> : null}
              <div className='row' style={{ marginTop: 8 }}>
                <button
                  type='button'
                  className='input'
                  onClick={() => removeSlot(slot.availability_id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {summary?.top_doctors?.length ? (
        <div style={{ marginTop: 24 }}>
          <h4>Top doctors by upcoming appointments</h4>
          <ul className='list'>
            {summary.top_doctors.map((doc) => (
              <li key={doc.doctor_id}>
                {doc.name}
                {' – '}
                {doc.upcoming}
                {' upcoming visits'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
