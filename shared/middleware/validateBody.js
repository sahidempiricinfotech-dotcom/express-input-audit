function validateBody(schema) {
  return function validateRequestBody(req, res, next) {
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({ errors: result.error.details });
    }
    req.body = result.value;
    next();
  };
}

module.exports = validateBody;
