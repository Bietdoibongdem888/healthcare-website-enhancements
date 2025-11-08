const { verify, blackList } = require('../providers/jwt');
const { Unauthorized } = require('../../helpers/errors');
module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new Unauthorized('Missing Authorization header');
    const { payload, isExpired, isInvalid } = await verify(token);
    if (isInvalid) throw new Unauthorized('Invalid token');
    if (isExpired) throw new Unauthorized('Token expired');
    if (payload?.jti && (await blackList.contains(payload.jti))) {
      throw new Unauthorized('Token is revoked');
    }
    req.user = payload;
    next();
  } catch (e) { next(e); }
};

