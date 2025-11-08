const db = require('./db');
async function record(action, user_id=null, meta=null){ try{ const conn = await db.connect(); await conn.execute('INSERT INTO audit_log (user_id, action, meta) VALUES (:user_id, :action, :meta)', { user_id, action, meta: meta? JSON.stringify(meta): null }); await conn.end(); }catch(e){ console.log('[AUDIT ERROR]', e.message); } }
module.exports = { record };
