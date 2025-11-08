-- Minimal schema for healthcare server (MySQL)
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

CREATE TABLE IF NOT EXISTS staff (
  staff_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50),
  PRIMARY KEY (staff_id)
);

CREATE TABLE IF NOT EXISTS department (
  department_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  PRIMARY KEY (department_id),
  CONSTRAINT UC_Department_Name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS doctor (
  doctor_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  specialty VARCHAR(150),
  department_id INT DEFAULT NULL,
  PRIMARY KEY (doctor_id),
  FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doctor_availability (
  availability_id INT NOT NULL AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  max_patients INT NOT NULL DEFAULT 1,
  booked_patients INT NOT NULL DEFAULT 0,
  status ENUM('available','blocked') NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (availability_id),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
  INDEX idx_availability_doctor_time (doctor_id, start_time, end_time),
  INDEX idx_availability_status (status)
);

CREATE TABLE IF NOT EXISTS patient (
  patient_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  contact_no VARCHAR(20),
  email VARCHAR(255),
  PRIMARY KEY (patient_id)
);

CREATE TABLE IF NOT EXISTS appointment (
  appointment_id INT NOT NULL AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  availability_id INT NULL,
  start_time DATETIME NOT NULL,
  notes TEXT,
  PRIMARY KEY (appointment_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE
);

-- sample data
-- Run `npm run seed` after applying schema to populate full HealthCare+ sample data.

-- Migration for appointments lifecycle and conflict checks
-- Adds end_time, status and an index to speed up conflict queries
ALTER TABLE appointment 
  ADD COLUMN IF NOT EXISTS end_time DATETIME NOT NULL AFTER start_time;
ALTER TABLE appointment 
  ADD COLUMN IF NOT EXISTS status ENUM(''scheduled'',''completed'',''canceled'') NOT NULL DEFAULT ''scheduled'';
ALTER TABLE appointment 
  ADD COLUMN IF NOT EXISTS availability_id INT NULL AFTER doctor_id;
ALTER TABLE appointment 
  ADD CONSTRAINT IF NOT EXISTS fk_appointment_availability FOREIGN KEY (availability_id) REFERENCES doctor_availability(availability_id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appt_doctor_time ON appointment (doctor_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appt_availability ON appointment (availability_id);

-- Enhance staff table for auth features
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL;
-- Map staff to patient for self-service bookings
ALTER TABLE staff ADD COLUMN IF NOT EXISTS patient_id INT NULL;
ALTER TABLE staff ADD CONSTRAINT IF NOT EXISTS fk_staff_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS idx_staff_patient ON staff(patient_id);

-- Doctors extra fields to support UI filters
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS hospital VARCHAR(255) NULL;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS district VARCHAR(100) NULL;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) NOT NULL DEFAULT 5.0;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS reviews INT NOT NULL DEFAULT 0;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS department_id INT NULL;
ALTER TABLE doctor ADD CONSTRAINT IF NOT EXISTS fk_doctor_department FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_doctor_specialty ON doctor(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_district ON doctor(district);
CREATE INDEX IF NOT EXISTS idx_doctor_department ON doctor(department_id);

-- Medical records
CREATE TABLE IF NOT EXISTS medical_record (
  record_id INT NOT NULL AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(record_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE SET NULL
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  meta JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Live support + chat assistant
CREATE TABLE IF NOT EXISTS support_session (
  session_id INT NOT NULL AUTO_INCREMENT,
  channel ENUM('hotline','ai') NOT NULL DEFAULT 'ai',
  patient_id INT NULL,
  contact_name VARCHAR(150) NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(20) NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  last_topic VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE SET NULL,
  INDEX idx_support_channel (channel),
  INDEX idx_support_patient (patient_id)
);

CREATE TABLE IF NOT EXISTS support_message (
  message_id INT NOT NULL AUTO_INCREMENT,
  session_id INT NOT NULL,
  author ENUM('patient','agent','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id),
  FOREIGN KEY (session_id) REFERENCES support_session(session_id) ON DELETE CASCADE,
  INDEX idx_support_message_session (session_id)
);
