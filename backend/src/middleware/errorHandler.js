import { ZodError } from 'zod'

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      issues: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const status = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({ message })
}
