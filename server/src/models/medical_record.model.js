const Joi = require('joi');
const db = require('../providers/db');

async function create(rec){
  const { error, value } = Joi.object({ patient_id:Joi.number().integer().required(), doctor_id:Joi.number().integer().required(), title:Joi.string().min(2).max(200).required(), description:Joi.string().allow('') }).validate(rec, { abortEarly:false });
  if (error){ const e = new Error('Validation'); e.status=400; e.details=error; throw e; }
  const [ins] = await db.query('INSERT INTO medical_record (patient_id,doctor_id,title,description) VALUES (?,?,?,?)',[value.patient_id,value.doctor_id,value.title,value.description||'']);
  return { record_id: ins.insertId, ...value, created_at: new Date() };
}

async function findByPatient(patient_id){
  const [rows] = await db.query('SELECT * FROM medical_record WHERE patient_id = ? ORDER BY created_at DESC',[patient_id]);
  return rows;
}

async function getById(id){
  const [rows] = await db.query('SELECT * FROM medical_record WHERE record_id = ?',[id]);
  return rows[0]||null;
}

module.exports = { create, findByPatient, getById };
