const HTTPError = require('./HTTPError');
class Prohibited extends HTTPError { constructor(message='Forbidden') { super(message, 403); } }
module.exports = Prohibited;
