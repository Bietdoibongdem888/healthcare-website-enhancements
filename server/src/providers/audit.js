const { AuditLog } = require('../database');

async function record(action, user_id = null, meta = null) {
  try {
    await AuditLog.create({ user_id, action, meta });
  } catch (err) {
    console.log('[AUDIT ERROR]', err?.message);
  }
}

module.exports = { record };
