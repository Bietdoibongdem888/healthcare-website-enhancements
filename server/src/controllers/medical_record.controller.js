const MR = require('../models/medical_record.model');

async function create(req,res,next){ try{ const rec = await MR.create(req.body); res.status(201).json(rec); } catch(e){ next(e); } }
async function listByPatient(req,res,next){ try{ const rows = await MR.findByPatient(req.params.patientId); res.json(rows); } catch(e){ next(e); } }
async function getById(req,res,next){ try{ const rec = await MR.getById(req.params.id); if(!rec) return res.status(404).json({message:'Not found'}); res.json(rec); } catch(e){ next(e); } }

module.exports = { create, listByPatient, getById };

async function listMine(req,res,next){ try { const pid = req.user?.patient_id; if(!pid) return res.status(401).json({message:'Unauthorized'}); const rows = await MR.findByPatient(pid); res.json(rows); } catch(e){ next(e); } }
module.exports.listMine = listMine;
