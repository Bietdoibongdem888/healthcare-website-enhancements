'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const patientSql = `INSERT IGNORE INTO patient (patient_id, first_name, last_name, contact_no, email, date_of_birth, gender, address, medical_history, created_at, updated_at)
      VALUES (1001, 'Huy', 'Nguyen', '0867963205', 'huynguyen24112004@gmail.com', '2004-11-24', 'male', 'VN', NULL, '${now}', '${now}')`;
    const staffSql = `INSERT IGNORE INTO staff (staff_id, first_name, last_name, phone, email, password, role, is_active, patient_id, doctor_id, created_at, updated_at)
      VALUES (1001, 'Huy', 'Nguyen', '0867963205', 'huynguyen24112004@gmail.com', '$2a$10$pVbVs65ACrRcmC10IB2/nuIRpLcCyVJZ4StKgIsR1SsXkshcacSHK', 'patient', 1, 1001, NULL, '${now}', '${now}')`;
    await queryInterface.sequelize.query(patientSql);
    await queryInterface.sequelize.query(staffSql);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE FROM staff WHERE email='huynguyen24112004@gmail.com'");
    await queryInterface.sequelize.query("DELETE FROM patient WHERE email='huynguyen24112004@gmail.com'");
  },
};
