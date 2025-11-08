const { BadRequest, NotFound, Unauthorized, Prohibited, InternalServerError } = require('../../helpers/errors');
module.exports = function error(err, req, res, next) {
  if (err && err.status) {
    return res.status(err.status).json({ message: err.message, details: err.details || null });
  }
  console.error('[UNHANDLED]', err);
  return res.status(500).json({ message: 'Internal server error' });
};
