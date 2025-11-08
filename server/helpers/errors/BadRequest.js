const HTTPError = require('./HTTPError');
class BadRequest extends HTTPError { constructor(details) { super('Bad Request', 400, details); } }
module.exports = BadRequest;
