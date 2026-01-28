import { ZodError } from 'zod'

export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  })

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

  // Include stack trace in development
  const response = {
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString() 
    })
  }

  res.status(status).json(response)
}
