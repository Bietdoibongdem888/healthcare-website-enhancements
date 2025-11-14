const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const departments = [
      { department_id: 1, name: 'Cardiology', description: 'Heart and vascular care', created_at: now, updated_at: now },
      { department_id: 2, name: 'Pediatrics', description: 'Child health services', created_at: now, updated_at: now },
      { department_id: 3, name: 'Neurology', description: 'Brain and nervous system', created_at: now, updated_at: now },
      { department_id: 4, name: 'Dermatology', description: 'Skin care', created_at: now, updated_at: now },
      { department_id: 5, name: 'Orthopedics', description: 'Bone and joint center', created_at: now, updated_at: now },
      { department_id: 6, name: 'Internal Medicine', description: 'Comprehensive care', created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('department', departments);

    const doctors = [
      {
        doctor_id: 1,
        first_name: 'Anh',
        last_name: 'Nguyen',
        specialty: 'Cardiology',
        hospital: 'HealthCare+ Central',
        district: 'Hoan Kiem',
        rating: 4.9,
        reviews: 214,
        department_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        doctor_id: 2,
        first_name: 'Thu',
        last_name: 'Le',
        specialty: 'Pediatrics',
        hospital: 'HealthCare+ Kids',
        district: 'Cau Giay',
        rating: 4.8,
        reviews: 188,
        department_id: 2,
        created_at: now,
        updated_at: now,
      },
      {
        doctor_id: 3,
        first_name: 'Quang',
        last_name: 'Tran',
        specialty: 'Neurology',
        hospital: 'NeuroCare',
        district: 'Dong Da',
        rating: 4.7,
        reviews: 162,
        department_id: 3,
        created_at: now,
        updated_at: now,
      },
    ];
    await queryInterface.bulkInsert('doctor', doctors);

    const patients = [
      {
        patient_id: 1,
        first_name: 'Minh',
        last_name: 'Pham',
        contact_no: '0987654321',
        email: 'minh.pham@example.com',
        date_of_birth: '1990-05-12',
        gender: 'male',
        address: '123 Nguyen Trai, Ha Noi',
        medical_history: 'Hypertension',
        created_at: now,
        updated_at: now,
      },
      {
        patient_id: 2,
        first_name: 'Lan',
        last_name: 'Vu',
        contact_no: '0978123456',
        email: 'lan.vu@example.com',
        date_of_birth: '1995-11-08',
        gender: 'female',
        address: '45 Tran Phu, Ha Noi',
        medical_history: 'Allergy to penicillin',
        created_at: now,
        updated_at: now,
      },
      {
        patient_id: 3,
        first_name: 'Hung',
        last_name: 'Do',
        contact_no: '0909123987',
        email: 'hung.do@example.com',
        date_of_birth: '1984-02-22',
        gender: 'male',
        address: '88 Hai Ba Trung, Ha Noi',
        medical_history: null,
        created_at: now,
        updated_at: now,
      },
    ];
    await queryInterface.bulkInsert('patient', patients);

    const hashedPassword = await bcrypt.hash('Password@123', 10);
    await queryInterface.bulkInsert('staff', [
      {
        staff_id: 1,
        first_name: 'Admin',
        last_name: 'HealthCare',
        phone: '0909000000',
        email: 'admin@healthcare.local',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        patient_id: null,
        doctor_id: null,
        created_at: now,
        updated_at: now,
      },
      {
        staff_id: 2,
        first_name: 'Anh',
        last_name: 'Nguyen',
        phone: '0911222333',
        email: 'anh.nguyen@healthcare.local',
        password: hashedPassword,
        role: 'doctor',
        is_active: true,
        patient_id: null,
        doctor_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        staff_id: 3,
        first_name: 'Minh',
        last_name: 'Pham',
        phone: '0987654321',
        email: 'minh.pham@example.com',
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        patient_id: 1,
        doctor_id: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    const availabilities = [
      {
        availability_id: 1,
        doctor_id: 1,
        start_time: new Date(Date.now() + 24 * 3600 * 1000),
        end_time: new Date(Date.now() + 24 * 3600 * 1000 + 3 * 3600 * 1000),
        max_patients: 5,
        booked_patients: 1,
        status: 'available',
        notes: 'Morning clinic',
        created_at: now,
        updated_at: now,
      },
      {
        availability_id: 2,
        doctor_id: 1,
        start_time: new Date(Date.now() + 48 * 3600 * 1000),
        end_time: new Date(Date.now() + 48 * 3600 * 1000 + 2 * 3600 * 1000),
        max_patients: 4,
        booked_patients: 0,
        status: 'available',
        notes: 'Telehealth block',
        created_at: now,
        updated_at: now,
      },
      {
        availability_id: 3,
        doctor_id: 2,
        start_time: new Date(Date.now() + 24 * 3600 * 1000),
        end_time: new Date(Date.now() + 24 * 3600 * 1000 + 4 * 3600 * 1000),
        max_patients: 6,
        booked_patients: 2,
        status: 'available',
        notes: 'Vaccination window',
        created_at: now,
        updated_at: now,
      },
    ];
    await queryInterface.bulkInsert('doctor_availability', availabilities);

    const appointments = [
      {
        appointment_id: 1,
        patient_id: 1,
        doctor_id: 1,
        availability_id: 1,
        start_time: new Date(Date.now() + 24 * 3600 * 1000 + 30 * 60000),
        end_time: new Date(Date.now() + 24 * 3600 * 1000 + 60 * 60000),
        status: 'confirmed',
        notes: 'Follow-up check',
        created_at: now,
        updated_at: now,
      },
      {
        appointment_id: 2,
        patient_id: 2,
        doctor_id: 2,
        availability_id: 3,
        start_time: new Date(Date.now() + 24 * 3600 * 1000 + 2 * 3600 * 1000),
        end_time: new Date(Date.now() + 24 * 3600 * 1000 + 2.5 * 3600 * 1000),
        status: 'pending',
        notes: 'First-time consultation',
        created_at: now,
        updated_at: now,
      },
      {
        appointment_id: 3,
        patient_id: 3,
        doctor_id: 3,
        availability_id: null,
        start_time: new Date(Date.now() + 72 * 3600 * 1000),
        end_time: new Date(Date.now() + 72 * 3600 * 1000 + 3600 * 1000),
        status: 'cancelled',
        notes: 'Rescheduled by patient',
        created_at: now,
        updated_at: now,
      },
    ];
    await queryInterface.bulkInsert('appointment', appointments);

    await queryInterface.bulkInsert('support_session', [
      {
        session_id: 1,
        channel: 'ai',
        patient_id: 1,
        contact_name: 'Minh Pham',
        contact_email: 'minh.pham@example.com',
        contact_phone: '0987654321',
        status: 'open',
        last_topic: 'Blood pressure medication',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('support_message', [
      {
        message_id: 1,
        session_id: 1,
        author: 'patient',
        content: 'Tôi cần tư vấn về thuốc huyết áp.',
        patient_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        message_id: 2,
        session_id: 1,
        author: 'assistant',
        content: 'Bác sĩ sẽ liên hệ lại trong 15 phút nữa.',
        patient_id: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('support_message', null, {});
    await queryInterface.bulkDelete('support_session', null, {});
    await queryInterface.bulkDelete('appointment', null, {});
    await queryInterface.bulkDelete('doctor_availability', null, {});
    await queryInterface.bulkDelete('staff', null, {});
    await queryInterface.bulkDelete('patient', null, {});
    await queryInterface.bulkDelete('doctor', null, {});
    await queryInterface.bulkDelete('department', null, {});
  },
};
