export function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return next(parsed.error)
    }

    req.body = parsed.data
    return next()
  }
}
