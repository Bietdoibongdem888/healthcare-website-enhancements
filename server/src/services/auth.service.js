const { v4: uuid } = require('uuid');
const db = require('../providers/db');
const { hashPassword } = require('../providers/hash');
const { TokenPair } = require('../providers/jwt');

function mapStaffRow(row) {
  if (!row) return null;
  return {
    id: row.staff_id,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone || null,
    email: row.email,
    role: row.role,
    patient_id: row.patient_id,
  };
}

async function findStaffByEmail(email) {
  const [rows] = await db.query(
    'SELECT staff_id, first_name, last_name, phone, email, role, is_active, patient_id FROM staff WHERE email = ?',
    [email],
  );
  return mapStaffRow(rows[0]);
}

async function createStaffWithPatient({ first_name, last_name, email, phone = null, role = 'user' }) {
  const password = await hashPassword(uuid());
  const [pIns] = await db.query(
    'INSERT INTO patient (first_name, last_name, contact_no, email) VALUES (?,?,?,?)',
    [first_name, last_name, phone, email],
  );
  const patient_id = pIns.insertId;
  const [sIns] = await db.query(
    'INSERT INTO staff (first_name,last_name,phone,email,password,role,is_active,patient_id) VALUES (?,?,?,?,?,?,1,?)',
    [first_name, last_name, phone, email, password, role, patient_id],
  );
  return {
    id: sIns.insertId,
    first_name,
    last_name,
    phone,
    email,
    role,
    patient_id,
  };
}

async function ensureSocialUser({ first_name, last_name, email, phone = null }) {
  const existing = await findStaffByEmail(email);
  if (existing) return existing;
  return createStaffWithPatient({ first_name, last_name, email, phone, role: 'user' });
}

async function issueTokenForStaff(staff) {
  const pair = await TokenPair.create({
    id: staff.id,
    role: staff.role,
    first_name: staff.first_name,
    last_name: staff.last_name,
    email: staff.email,
    phone: staff.phone || null,
    patient_id: staff.patient_id,
  });
  return {
    access: pair.access,
    refresh: pair.refresh,
    token: pair.access,
    user: staff,
  };
}

module.exports = {
  ensureSocialUser,
  issueTokenForStaff,
};
