const { v4: uuid } = require('uuid');
const { hashPassword } = require('../providers/hash');
const { TokenPair } = require('../providers/jwt');
const { Staff, Patient, sequelize } = require('../database');

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
    doctor_id: row.doctor_id ?? null,
  };
}

async function findStaffByEmail(email) {
  const staff = await Staff.findOne({ where: { email } });
  return mapStaffRow(staff);
}

async function createStaffWithPatient({ first_name, last_name, email, phone = null, role = 'patient' }) {
  return sequelize.transaction(async (transaction) => {
    const password = await hashPassword(uuid());
    const patient = await Patient.create(
      {
        first_name,
        last_name,
        contact_no: phone,
        email,
      },
      { transaction }
    );
    const staff = await Staff.create(
      {
        first_name,
        last_name,
        phone,
        email,
        password,
        role,
        patient_id: patient.patient_id,
      },
      { transaction }
    );
    return mapStaffRow(staff);
  });
}

async function ensureSocialUser({ first_name, last_name, email, phone = null }) {
  const existing = await findStaffByEmail(email);
  if (existing) return existing;
  return createStaffWithPatient({ first_name, last_name, email, phone, role: 'patient' });
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
    doctor_id: staff.doctor_id ?? null,
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
  findStaffByEmail,
};
