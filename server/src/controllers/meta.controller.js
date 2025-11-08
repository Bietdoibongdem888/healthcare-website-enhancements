const db = require('../providers/db');

async function specialties(req,res,next){ try { const [rows]=await db.query("SELECT DISTINCT specialty FROM doctor WHERE specialty IS NOT NULL AND specialty <> '' ORDER BY specialty"); res.json(rows.map(r=>r.specialty)); } catch(e){ next(e); } }
async function districts(req,res,next){ try { const [rows]=await db.query("SELECT DISTINCT district FROM doctor WHERE district IS NOT NULL AND district <> '' ORDER BY district"); res.json(rows.map(r=>r.district)); } catch(e){ next(e); } }

module.exports = { specialties, districts };
