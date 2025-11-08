class HTTPError extends Error {
  constructor(message = 'HTTP Error', status = 500, details = null) {
    super(typeof message === 'string' ? message : 'HTTP Error');
    this.status = status;
    this.details = typeof message === 'object' ? message : details;
  }
}
module.exports = HTTPError;
