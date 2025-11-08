const HTTPError = require('./HTTPError');
class NotFound extends HTTPError { constructor(message='Resource not found') { super(message, 404); } }
module.exports = NotFound;
