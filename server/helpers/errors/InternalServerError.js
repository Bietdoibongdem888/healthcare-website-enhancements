const HTTPError = require('./HTTPError');
class InternalServerError extends HTTPError { constructor(details) { super('Internal Server Error', 500, details); } }
module.exports = InternalServerError;
