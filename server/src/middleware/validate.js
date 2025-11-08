const { BadRequest } = require('../../helpers/errors');
module.exports = function validate(schemaFactory) {
  return (req, res, next) => {
    try {
      const schema = typeof schemaFactory === 'function' ? schemaFactory(req) : schemaFactory;
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      if (error) throw new BadRequest(error.details?.reduce((a, c) => ({ ...a, [c.path.join('.')]: c.message }), {}));
      req.body = value;
      next();
    } catch (e) { next(e); }
  };
};
