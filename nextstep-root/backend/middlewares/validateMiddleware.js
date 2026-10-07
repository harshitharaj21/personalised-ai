/**
 * Generic Zod schema validation middleware factory.
 * Usage: router.post('/route', validate(mySchema), handler)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = result.data; // replace with parsed/coerced data
  next();
};
