'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const password = '$2a$10$pVbVs65ACrRcmC10IB2/nuIRpLcCyVJZ4StKgIsR1SsXkshcacSHK'; // Huycockiu24@

    // tạo patient mới
    await queryInterface.bulkInsert('patient', [
      {
        patient_id: 4,
        first_name: 'Huy',
        last_name: 'Nguyen',
        contact_no: '0867963205',
        email: 'huynguyen24112004@gmail.com',
        date_of_birth: '2004-11-24',
        gender: 'male',
        address: 'VN',
        medical_history: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    // tạo staff (patient role)
    await queryInterface.bulkInsert('staff', [
      {
        staff_id: 4,
        first_name: 'Huy',
        last_name: 'Nguyen',
        phone: '0867963205',
        email: 'huynguyen24112004@gmail.com',
        password,
        role: 'patient',
        is_active: true,
        patient_id: 4,
        doctor_id: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('staff', { email: 'huynguyen24112004@gmail.com' }, {});
    await queryInterface.bulkDelete('patient', { email: 'huynguyen24112004@gmail.com' }, {});
  },
};
