const { Prohibited } = require('../../helpers/errors');
module.exports = function permit(...roles) {
  return function (req, res, next) {
    const role = req.user?.role;
    if (!roles.length || roles.includes(role)) return next();
    next(new Prohibited('Insufficient permission'));
  };
};
