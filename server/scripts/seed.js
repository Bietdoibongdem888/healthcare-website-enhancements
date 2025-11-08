// Seed dataset for HealthCare+ derived from the legacy Pan domain
// Converts bakery/inventory concepts into healthcare-centric data
const db = require('../src/providers/db');
const { hashPassword } = require('../src/providers/hash');

const departmentSeeds = [
  { slug: 'cardio', name: 'Khoa Tim mạch', description: 'Điều trị bệnh lý tim mạch, huyết áp và rối loạn tuần hoàn.' },
  { slug: 'pediatrics', name: 'Khoa Nhi', description: 'Chăm sóc sức khỏe cho trẻ em từ sơ sinh đến vị thành niên.' },
  { slug: 'neuro', name: 'Khoa Thần kinh', description: 'Chẩn đoán và điều trị các bệnh lý hệ thần kinh trung ương và ngoại biên.' },
  { slug: 'ortho', name: 'Khoa Cơ xương khớp', description: 'Điều trị chấn thương, phục hồi chức năng cơ xương khớp.' },
  { slug: 'derma', name: 'Khoa Da liễu', description: 'Điều trị bệnh lý về da và thẩm mỹ da.' },
  { slug: 'oncology', name: 'Trung tâm Ung bướu', description: 'Điều trị ung thư đa mô thức với phác đồ cá thể hóa.' },
  { slug: 'gastro', name: 'Khoa Tiêu hóa', description: 'Chẩn đoán và điều trị bệnh lý dạ dày, gan mật, ruột.' },
  { slug: 'endocrine', name: 'Khoa Nội tiết', description: 'Chăm sóc bệnh nhân đái tháo đường, tuyến giáp và rối loạn nội tiết.' },
  { slug: 'obgyn', name: 'Khoa Sản - Phụ khoa', description: 'Chăm sóc sức khỏe phụ nữ, tiền sản và thai sản an toàn.' },
  { slug: 'pulmo', name: 'Khoa Hô hấp', description: 'Điều trị bệnh phổi tắc nghẽn, hen và các bệnh truyền nhiễm đường hô hấp.' },
  { slug: 'ophtha', name: 'Khoa Mắt', description: 'Khám, chẩn đoán và phẫu thuật nhãn khoa.' },
];

const doctorSeeds = [
  { slug: 'anh-nguyen', first_name: 'Anh', last_name: 'Nguyen', specialty: 'Cardiology', hospital: 'PanCare Heart Center', district: 'Hai Ba Trung', rating: 4.9, reviews: 210, departmentSlug: 'cardio' },
  { slug: 'thu-le', first_name: 'Thu', last_name: 'Le', specialty: 'Pediatrics', hospital: 'HealthPlus Children Clinic', district: 'Hoan Kiem', rating: 4.8, reviews: 188, departmentSlug: 'pediatrics' },
  { slug: 'quang-tran', first_name: 'Quang', last_name: 'Tran', specialty: 'Neurology', hospital: 'Aurora Neurology Institute', district: 'Cau Giay', rating: 4.7, reviews: 165, departmentSlug: 'neuro' },
  { slug: 'minh-pham', first_name: 'Minh', last_name: 'Pham', specialty: 'Orthopedics', hospital: 'Riverside Orthopedic Hospital', district: 'Long Bien', rating: 4.6, reviews: 142, departmentSlug: 'ortho' },
  { slug: 'lan-vu', first_name: 'Lan', last_name: 'Vu', specialty: 'Dermatology', hospital: 'Lotus Dermatology Center', district: 'Thanh Xuan', rating: 4.5, reviews: 98, departmentSlug: 'derma' },
  { slug: 'hanh-do', first_name: 'Hanh', last_name: 'Do', specialty: 'Oncology', hospital: 'Sunrise Cancer Institute', district: 'Ba Dinh', rating: 4.9, reviews: 240, departmentSlug: 'oncology' },
  { slug: 'khoa-vo', first_name: 'Khoa', last_name: 'Vo', specialty: 'Gastroenterology', hospital: 'Harmony Digestive Clinic', district: 'Tay Ho', rating: 4.6, reviews: 133, departmentSlug: 'gastro' },
  { slug: 'linh-truong', first_name: 'Linh', last_name: 'Truong', specialty: 'Endocrinology', hospital: 'VietHeal Diabetes Center', district: 'Ha Dong', rating: 4.7, reviews: 176, departmentSlug: 'endocrine' },
  { slug: 'phuong-bui', first_name: 'Phuong', last_name: 'Bui', specialty: 'Obstetrics and Gynecology', hospital: 'Greenfield Women Hospital', district: 'Nam Tu Liem', rating: 4.8, reviews: 201, departmentSlug: 'obgyn' },
  { slug: 'son-mai', first_name: 'Son', last_name: 'Mai', specialty: 'Pulmonology', hospital: 'Blue Sky Respiratory Clinic', district: 'Bac Tu Liem', rating: 4.5, reviews: 121, departmentSlug: 'pulmo' },
  { slug: 'yen-dang', first_name: 'Yen', last_name: 'Dang', specialty: 'Ophthalmology', hospital: 'PanSight Eye Hospital', district: 'Hai Chau', rating: 4.8, reviews: 189, departmentSlug: 'ophtha' },
  { slug: 'tien-nguyen', first_name: 'Tien', last_name: 'Nguyen', specialty: 'Cardiology', hospital: 'Pan Regional Medical Center', district: 'Thu Duc', rating: 4.7, reviews: 154, departmentSlug: 'cardio' },
];

const availabilitySeeds = [
  { slug: 'anh-nguyen-am-block', doctorSlug: 'anh-nguyen', start: '2025-11-15T01:00:00Z', end: '2025-11-15T04:00:00Z', max_patients: 5, notes: 'Morning cardiology clinic' },
  { slug: 'anh-nguyen-oct-block', doctorSlug: 'anh-nguyen', start: '2025-10-20T00:30:00Z', end: '2025-10-20T03:30:00Z', max_patients: 4, notes: 'Quarterly review slots' },
  { slug: 'thu-le-am-block', doctorSlug: 'thu-le', start: '2025-10-10T01:30:00Z', end: '2025-10-10T04:00:00Z', max_patients: 6, notes: 'Pediatrics vaccination morning' },
  { slug: 'thu-le-nov-block', doctorSlug: 'thu-le', start: '2025-11-15T01:30:00Z', end: '2025-11-15T04:30:00Z', max_patients: 6, notes: 'Weekend pediatrics clinic' },
  { slug: 'quang-tran-eval', doctorSlug: 'quang-tran', start: '2025-11-16T03:00:00Z', end: '2025-11-16T05:00:00Z', max_patients: 3, notes: 'Neurology evaluations' },
  { slug: 'minh-pham-physio', doctorSlug: 'minh-pham', start: '2025-11-18T06:00:00Z', end: '2025-11-18T09:00:00Z', max_patients: 5, notes: 'Orthopedic post-op programme' },
  { slug: 'lan-vu-derma', doctorSlug: 'lan-vu', start: '2025-11-20T08:30:00Z', end: '2025-11-20T11:30:00Z', max_patients: 4, notes: 'Dermatology review clinic' },
  { slug: 'lan-vu-oct-laser', doctorSlug: 'lan-vu', start: '2025-10-12T04:00:00Z', end: '2025-10-12T07:00:00Z', max_patients: 4, notes: 'Laser therapy follow-up' },
  { slug: 'hanh-do-oncology', doctorSlug: 'hanh-do', start: '2025-10-05T07:00:00Z', end: '2025-10-05T10:00:00Z', max_patients: 4, notes: 'Oncology cycle reviews' },
  { slug: 'khoa-vo-gastro', doctorSlug: 'khoa-vo', start: '2025-09-25T03:00:00Z', end: '2025-09-25T05:00:00Z', max_patients: 3, notes: 'Digestive consults' },
  { slug: 'linh-truong-endo', doctorSlug: 'linh-truong', start: '2025-11-07T02:30:00Z', end: '2025-11-07T05:30:00Z', max_patients: 5, notes: 'Endocrinology follow-ups' },
  { slug: 'linh-truong-gestational', doctorSlug: 'linh-truong', start: '2025-11-19T04:00:00Z', end: '2025-11-19T06:00:00Z', max_patients: 4, notes: 'Gestational diabetes counselling' },
  { slug: 'phuong-bui-ob', doctorSlug: 'phuong-bui', start: '2025-11-08T01:30:00Z', end: '2025-11-08T04:00:00Z', max_patients: 4, notes: 'Prenatal education clinic' },
  { slug: 'son-mai-pulmo', doctorSlug: 'son-mai', start: '2025-10-18T05:00:00Z', end: '2025-10-18T08:00:00Z', max_patients: 4, notes: 'Respiratory follow ups' },
  { slug: 'yen-dang-eye', doctorSlug: 'yen-dang', start: '2025-10-02T02:00:00Z', end: '2025-10-02T05:00:00Z', max_patients: 5, notes: 'Vision screening day' },
  { slug: 'yen-dang-nov-eye', doctorSlug: 'yen-dang', start: '2025-11-22T05:30:00Z', end: '2025-11-22T08:30:00Z', max_patients: 5, notes: 'Eye care weekend clinic' },
  { slug: 'tien-nguyen-cardiology', doctorSlug: 'tien-nguyen', start: '2025-11-23T01:30:00Z', end: '2025-11-23T04:30:00Z', max_patients: 4, notes: 'Cardiology clearance session' },
];

const patientSeeds = [
  { slug: 'linh-tran', first_name: 'Linh', last_name: 'Tran', contact_no: '0903123456', email: 'linh.tran@care.vn' },
  { slug: 'bao-le', first_name: 'Bao', last_name: 'Le', contact_no: '0905123789', email: 'bao.le@care.vn' },
  { slug: 'chi-nguyen', first_name: 'Chi', last_name: 'Nguyen', contact_no: '0912334455', email: 'chi.nguyen@care.vn' },
  { slug: 'duy-pham', first_name: 'Duy', last_name: 'Pham', contact_no: '0987112233', email: 'duy.pham@care.vn' },
  { slug: 'mai-vo', first_name: 'Mai', last_name: 'Vo', contact_no: '0976112456', email: 'mai.vo@care.vn' },
  { slug: 'son-huynh', first_name: 'Son', last_name: 'Huynh', contact_no: '0968234789', email: 'son.huynh@care.vn' },
  { slug: 'hoa-dang', first_name: 'Hoa', last_name: 'Dang', contact_no: '0933445566', email: 'hoa.dang@care.vn' },
  { slug: 'lanh-ngo', first_name: 'Lanh', last_name: 'Ngo', contact_no: '0922456677', email: 'lanh.ngo@care.vn' },
  { slug: 'ngoc-bui', first_name: 'Ngoc', last_name: 'Bui', contact_no: '0911223344', email: 'ngoc.bui@care.vn' },
  { slug: 'thao-phan', first_name: 'Thao', last_name: 'Phan', contact_no: '0945667788', email: 'thao.phan@care.vn' },
  { slug: 'trung-vo', first_name: 'Trung', last_name: 'Vo', contact_no: '0909988776', email: 'trung.vo@care.vn' },
  { slug: 'anh-tu', first_name: 'Anh', last_name: 'Tu', contact_no: '0956781234', email: 'anh.tu@care.vn' },
];

const staffSeeds = [
  { email: 'admin@healthcareplus.vn', first_name: 'Quynh', last_name: 'Nguyen', password: 'Admin@123', role: 'admin', is_active: true },
  { email: 'support@healthcareplus.vn', first_name: 'Tuan', last_name: 'Pham', password: 'Support@123', role: 'admin', is_active: true },
  { email: 'linh.tran@care.vn', first_name: 'Linh', last_name: 'Tran', password: 'Patient@123', role: 'user', is_active: true, patientSlug: 'linh-tran' },
  { email: 'bao.le@care.vn', first_name: 'Bao', last_name: 'Le', password: 'Patient@123', role: 'user', is_active: true, patientSlug: 'bao-le' },
  { email: 'chi.nguyen@care.vn', first_name: 'Chi', last_name: 'Nguyen', password: 'Patient@123', role: 'user', is_active: true, patientSlug: 'chi-nguyen' },
  { email: 'hoa.dang@care.vn', first_name: 'Hoa', last_name: 'Dang', password: 'Patient@123', role: 'user', is_active: true, patientSlug: 'hoa-dang' },
  { email: 'duy.pham@care.vn', first_name: 'Duy', last_name: 'Pham', password: 'Patient@123', role: 'user', is_active: true, patientSlug: 'duy-pham' },
];

const appointmentSeeds = [
  { slug: 'linh-cardiology-followup', patientSlug: 'linh-tran', doctorSlug: 'anh-nguyen', start: '2025-11-15T01:30:00Z', end: '2025-11-15T02:00:00Z', status: 'scheduled', notes: 'Routine heart follow-up after medication update.' },
  { slug: 'bao-pediatrics-check', patientSlug: 'bao-le', doctorSlug: 'thu-le', start: '2025-11-15T02:00:00Z', end: '2025-11-15T02:30:00Z', status: 'scheduled', notes: 'Quarterly pediatric check-up.' },
  { slug: 'chi-neuro-eval', patientSlug: 'chi-nguyen', doctorSlug: 'quang-tran', start: '2025-11-16T03:30:00Z', end: '2025-11-16T04:00:00Z', status: 'scheduled', notes: 'Migraine evaluation follow-up.' },
  { slug: 'duy-ortho-physio', patientSlug: 'duy-pham', doctorSlug: 'minh-pham', start: '2025-11-18T07:00:00Z', end: '2025-11-18T07:30:00Z', status: 'scheduled', notes: 'Post-surgery physiotherapy session.' },
  { slug: 'mai-derma-review', patientSlug: 'mai-vo', doctorSlug: 'lan-vu', start: '2025-11-20T09:00:00Z', end: '2025-11-20T09:30:00Z', status: 'scheduled', notes: 'Review response to dermatitis treatment.' },
  { slug: 'linh-cardiology-oct', patientSlug: 'linh-tran', doctorSlug: 'anh-nguyen', start: '2025-10-20T01:30:00Z', end: '2025-10-20T02:00:00Z', status: 'completed', notes: 'Blood pressure monitoring visit.' },
  { slug: 'bao-pediatrics-oct', patientSlug: 'bao-le', doctorSlug: 'thu-le', start: '2025-10-10T02:30:00Z', end: '2025-10-10T03:00:00Z', status: 'completed', notes: 'Flu vaccine booster.' },
  { slug: 'chi-gastro-sept', patientSlug: 'chi-nguyen', doctorSlug: 'khoa-vo', start: '2025-09-25T04:00:00Z', end: '2025-09-25T04:30:00Z', status: 'completed', notes: 'Digestive health consult after treatment.' },
  { slug: 'son-oncology-oct', patientSlug: 'son-huynh', doctorSlug: 'hanh-do', start: '2025-10-05T08:00:00Z', end: '2025-10-05T08:30:00Z', status: 'completed', notes: 'Monthly oncology follow-up.' },
  { slug: 'lanh-endocrine-nov', patientSlug: 'lanh-ngo', doctorSlug: 'linh-truong', start: '2025-11-07T03:00:00Z', end: '2025-11-07T03:30:00Z', status: 'canceled', notes: 'Thyroid review (patient canceled).' },
  { slug: 'hoa-ob-nov', patientSlug: 'hoa-dang', doctorSlug: 'phuong-bui', start: '2025-11-08T02:00:00Z', end: '2025-11-08T02:30:00Z', status: 'canceled', notes: 'Prenatal class scheduling.' },
  { slug: 'son-eye-nov', patientSlug: 'son-huynh', doctorSlug: 'yen-dang', start: '2025-11-22T06:30:00Z', end: '2025-11-22T07:00:00Z', status: 'scheduled', notes: 'Annual vision screening.' },
  { slug: 'hoa-cardio-nov', patientSlug: 'hoa-dang', doctorSlug: 'tien-nguyen', start: '2025-11-23T02:30:00Z', end: '2025-11-23T03:00:00Z', status: 'scheduled', notes: 'Cardiology clearance for maternity plan.' },
  { slug: 'ngoc-derma-oct', patientSlug: 'ngoc-bui', doctorSlug: 'lan-vu', start: '2025-10-12T05:00:00Z', end: '2025-10-12T05:30:00Z', status: 'completed', notes: 'Laser therapy review.' },
  { slug: 'thao-endocrine-nov', patientSlug: 'thao-phan', doctorSlug: 'linh-truong', start: '2025-11-19T04:30:00Z', end: '2025-11-19T05:00:00Z', status: 'scheduled', notes: 'Gestational diabetes counseling.' },
  { slug: 'trung-pulmo-oct', patientSlug: 'trung-vo', doctorSlug: 'son-mai', start: '2025-10-18T06:00:00Z', end: '2025-10-18T06:30:00Z', status: 'completed', notes: 'Post-bronchitis check.' },
  { slug: 'anh-tu-eye-oct', patientSlug: 'anh-tu', doctorSlug: 'yen-dang', start: '2025-10-02T02:30:00Z', end: '2025-10-02T03:00:00Z', status: 'completed', notes: 'Dry eye treatment follow-up.' },
];

const medicalRecordSeeds = [
  { patientSlug: 'linh-tran', doctorSlug: 'anh-nguyen', title: 'Hypertension follow-up', description: 'Blood pressure stabilized; continue current medication.', created_at: '2025-10-20T04:00:00Z' },
  { patientSlug: 'bao-le', doctorSlug: 'thu-le', title: 'Vaccination booster record', description: 'Administered influenza booster without reactions.', created_at: '2025-10-10T05:00:00Z' },
  { patientSlug: 'chi-nguyen', doctorSlug: 'quang-tran', title: 'Migraine treatment plan', description: 'Initiated preventive therapy; scheduled follow-up.', created_at: '2025-09-15T07:30:00Z' },
  { patientSlug: 'duy-pham', doctorSlug: 'minh-pham', title: 'ACL reconstruction rehab', description: 'Knee strength improving; continue physiotherapy.', created_at: '2025-09-28T06:00:00Z' },
  { patientSlug: 'mai-vo', doctorSlug: 'lan-vu', title: 'Dermatitis management', description: 'Skin lesions reduced; maintain topical treatment.', created_at: '2025-10-05T08:15:00Z' },
  { patientSlug: 'son-huynh', doctorSlug: 'hanh-do', title: 'Oncology cycle review', description: 'Tumor markers stable; next cycle scheduled.', created_at: '2025-10-05T09:30:00Z' },
  { patientSlug: 'hoa-dang', doctorSlug: 'phuong-bui', title: 'Prenatal screening results', description: 'All screenings normal; encourage regular exercise.', created_at: '2025-10-12T04:45:00Z' },
  { patientSlug: 'lanh-ngo', doctorSlug: 'linh-truong', title: 'Thyroid function assessment', description: 'TSH levels elevated; adjust levothyroxine dosage.', created_at: '2025-09-30T03:20:00Z' },
  { patientSlug: 'ngoc-bui', doctorSlug: 'lan-vu', title: 'Laser therapy progress', description: 'Pigmentation lightening; next session in four weeks.', created_at: '2025-10-12T06:10:00Z' },
];

const auditSeeds = [
  { action: 'auth.login', userEmail: 'admin@healthcareplus.vn', at: '2025-11-01T01:00:00Z', meta: { email: 'admin@healthcareplus.vn', source: 'seed-demo' } },
  { action: 'appointment.create', userEmail: 'linh.tran@care.vn', appointmentSlug: 'linh-cardiology-followup', at: '2025-11-05T09:15:00Z', meta: { channel: 'portal' } },
  { action: 'appointment.cancel', userEmail: 'hoa.dang@care.vn', appointmentSlug: 'hoa-ob-nov', at: '2025-11-06T07:30:00Z', meta: { reason: 'travel' } },
  { action: 'medical_record.create', userEmail: 'support@healthcareplus.vn', at: '2025-10-12T05:00:00Z', meta: { patient_slug: 'hoa-dang', doctor_slug: 'phuong-bui' } },
  { action: 'availability.create', userEmail: 'support@healthcareplus.vn', at: '2025-11-10T03:00:00Z', meta: { doctor_slug: 'anh-nguyen' } },
];

async function truncateTables() {
  const tables = [
    'support_message',
    'support_session',
    'audit_log',
    'medical_record',
    'appointment',
    'doctor_availability',
    'staff',
    'patient',
    'doctor',
    'department',
  ];
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await db.query(`TRUNCATE TABLE ${table}`);
  }
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function seedDepartments() {
  const map = {};
  for (const dept of departmentSeeds) {
    const [res] = await db.query('INSERT INTO department (name, description) VALUES (?, ?)', [dept.name, dept.description || null]);
    map[dept.slug] = res.insertId;
  }
  return map;
}

async function seedDoctors(departmentMap) {
  const map = {};
  for (const doc of doctorSeeds) {
    const department_id = doc.departmentSlug ? departmentMap[doc.departmentSlug] || null : null;
    const [res] = await db.query(
      'INSERT INTO doctor (first_name, last_name, specialty, hospital, district, rating, reviews, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [doc.first_name, doc.last_name, doc.specialty, doc.hospital, doc.district, doc.rating, doc.reviews, department_id]
    );
    map[doc.slug] = res.insertId;
  }
  return map;
}

async function seedPatients() {
  const map = {};
  for (const patient of patientSeeds) {
    const [res] = await db.query(
      'INSERT INTO patient (first_name, last_name, contact_no, email) VALUES (?, ?, ?, ?)',
      [patient.first_name, patient.last_name, patient.contact_no || null, patient.email || null]
    );
    map[patient.slug] = res.insertId;
  }
  return map;
}

async function seedStaff(patientMap) {
  const map = {};
  for (const staff of staffSeeds) {
    const patientId = staff.patientSlug ? patientMap[staff.patientSlug] : null;
    if (staff.patientSlug && !patientId) {
      throw new Error(`Missing patient mapping for staff ${staff.email}`);
    }
    const hashed = await hashPassword(staff.password);
    const [res] = await db.query(
      'INSERT INTO staff (first_name, last_name, email, password, role, is_active, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [staff.first_name, staff.last_name, staff.email, hashed, staff.role, staff.is_active ? 1 : 0, patientId]
    );
    map[staff.email] = res.insertId;
  }
  return map;
}

async function seedAvailabilities(doctorMap) {
  const bySlug = {};
  const byDoctor = {};
  for (const slot of availabilitySeeds) {
    const doctorId = doctorMap[slot.doctorSlug];
    if (!doctorId) throw new Error(`Missing doctor mapping for availability ${slot.slug}`);
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const [res] = await db.query(
      'INSERT INTO doctor_availability (doctor_id, start_time, end_time, max_patients, notes) VALUES (?, ?, ?, ?, ?)',
      [doctorId, start, end, slot.max_patients || 1, slot.notes || null]
    );
    const record = { id: res.insertId, doctorId, start, end, max_patients: slot.max_patients || 1, booked_patients: 0 };
    bySlug[slot.slug] = record;
    if (!byDoctor[slot.doctorSlug]) byDoctor[slot.doctorSlug] = [];
    byDoctor[slot.doctorSlug].push(record);
  }
  return { bySlug, byDoctor };
}

async function seedAppointments({ doctorMap, patientMap, availabilityByDoctor }) {
  const map = {};
  for (const appt of appointmentSeeds) {
    const doctorId = doctorMap[appt.doctorSlug];
    const patientId = patientMap[appt.patientSlug];
    if (!doctorId) throw new Error(`Missing doctor mapping for ${appt.doctorSlug}`);
    if (!patientId) throw new Error(`Missing patient mapping for ${appt.patientSlug}`);
    const start = new Date(appt.start);
    const end = appt.end ? new Date(appt.end) : new Date(start.getTime() + 30 * 60000);
    let availabilityId = null;
    const slots = availabilityByDoctor[appt.doctorSlug] || [];
    for (const slot of slots) {
      if (start >= slot.start && end <= slot.end && slot.booked_patients < slot.max_patients) {
        availabilityId = slot.id;
        slot.booked_patients += 1;
        break;
      }
    }
    const [res] = await db.query(
      'INSERT INTO appointment (patient_id, doctor_id, availability_id, start_time, end_time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, availabilityId, start, end, appt.notes || '', appt.status || 'scheduled']
    );
    map[appt.slug] = res.insertId;
    if (availabilityId) {
      await db.query(
        `UPDATE doctor_availability 
            SET booked_patients = booked_patients + 1,
                status = CASE WHEN booked_patients + 1 >= max_patients THEN 'blocked' ELSE status END
          WHERE availability_id = ?`,
        [availabilityId]
      );
    }
  }
  return map;
}

async function seedRecords({ doctorMap, patientMap }) {
  for (const rec of medicalRecordSeeds) {
    const doctorId = doctorMap[rec.doctorSlug];
    const patientId = patientMap[rec.patientSlug];
    if (!doctorId) throw new Error(`Missing doctor mapping for record ${rec.title}`);
    if (!patientId) throw new Error(`Missing patient mapping for record ${rec.title}`);
    await db.query(
      'INSERT INTO medical_record (patient_id, doctor_id, title, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [patientId, doctorId, rec.title, rec.description || '', rec.created_at ? new Date(rec.created_at) : new Date()]
    );
  }
}

async function seedAudits({ staffMap, appointmentMap }) {
  for (const item of auditSeeds) {
    const userId = item.userEmail ? staffMap[item.userEmail] || null : null;
    const meta = item.meta ? { ...item.meta } : {};
    if (item.appointmentSlug) {
      const apptId = appointmentMap[item.appointmentSlug];
      if (apptId) meta.appointment_id = apptId;
    }
    await db.query(
      'INSERT INTO audit_log (user_id, action, meta, created_at) VALUES (?, ?, ?, ?)',
      [userId, item.action, Object.keys(meta).length ? JSON.stringify(meta) : null, item.at ? new Date(item.at) : new Date()]
    );
  }
}

(async function seed() {
  try {
    console.log('⏳ Seeding HealthCare+ data (converted from Pan) ...');
    await truncateTables();
    const departmentMap = await seedDepartments();
    const doctorMap = await seedDoctors(departmentMap);
    const availabilityMaps = await seedAvailabilities(doctorMap);
    const patientMap = await seedPatients();
    const staffMap = await seedStaff(patientMap);
    const appointmentMap = await seedAppointments({ doctorMap, patientMap, availabilityByDoctor: availabilityMaps.byDoctor });
    await seedRecords({ doctorMap, patientMap });
    await seedAudits({ staffMap, appointmentMap });
    console.log('✅ Seed data synchronized successfully.');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    try { await db.end(); } catch (_) {}
    process.exit(1);
  }
})();
