const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, _res, next) => {
  const toValidate = {};
  if (schema.body) toValidate.body = req.body;
  if (schema.query) toValidate.query = req.query;
  if (schema.params) toValidate.params = req.params;

  for (const key of Object.keys(toValidate)) {
    const { error, value } = schema[key].validate(toValidate[key], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return next(
        ApiError.badRequest(
          'Validation failed',
          error.details.map((d) => ({ path: d.path.join('.'), message: d.message }))
        )
      );
    }
    req[key] = value;
  }

  next();
};

module.exports = validate;
