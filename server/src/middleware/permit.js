const { Prohibited } = require('../../helpers/errors');

module.exports = function permit(...roles) {
  return function permitMiddleware(req, res, next) {
    const role = req.user?.role;
    if (!role) return next(new Prohibited('Authentication required'));
    if (!roles.length) return next();
    if (role === 'admin') return next();
    if (roles.includes(role)) return next();
    return next(new Prohibited('Insufficient permission'));
  };
};
